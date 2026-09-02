/**
 * Edge WebSocket data plane handler.
 * Terminates WebSocket, authenticates protocol request, validates destination,
 * opens TCP socket via Cloudflare Sockets API, and pumps bidirectional traffic.
 */

import { connect } from 'cloudflare:sockets';
import { C1Repository } from '../../database/repo';
import { parseVlessRequest, buildVlessResponseHeader } from '../../protocols/vless/parser';
import { parseTrojanRequest, sha224 } from '../../protocols/trojan/parser';
import { decryptAndParseShadowsocksRequest } from '../../protocols/shadowsocks/parser';
import { ParsedProtocolRequest } from '../../protocols/types';
import { validateOutboundTarget } from '../../routing/target-policy';
import { checkAndRecordClientIp, evaluateUserPolicy } from '../../users/policy';
import { pipeSocketToWebSocket, StreamAccounting } from './stream';
import { C1Error, ErrorCode } from '../../app/errors';

export interface WebSocketEnv {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function handleWebSocketUpgrade(
  request: Request,
  protocolName: 'vless' | 'trojan' | 'shadowsocks',
  env: WebSocketEnv
): Promise<Response> {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';

  // Cloudflare WebSocketPair
  const webSocketPair = new WebSocketPair();
  const [clientWs, serverWs] = Object.values(webSocketPair);

  serverWs.accept();

  // Process the connection asynchronously after returning 101 to client
  processWebSocketSession(serverWs, protocolName, clientIp, env).catch((err) => {
    console.error(`[C1-DATA] Session error:`, err);
    try {
      serverWs.close(1011, 'Internal error');
    } catch {}
  });

  return new Response(null, {
    status: 101,
    webSocket: clientWs,
    headers: {
      'Sec-WebSocket-Protocol': request.headers.get('Sec-WebSocket-Protocol') || '',
    },
  });
}

async function processWebSocketSession(
  ws: WebSocket,
  protocolName: 'vless' | 'trojan' | 'shadowsocks',
  clientIp: string,
  env: WebSocketEnv
): Promise<void> {
  const repo = new C1Repository(env.DB);

  // Wait for the first incoming packet containing the protocol handshake
  const firstMessage = await new Promise<Uint8Array | null>((resolve) => {
    const onMessage = (event: MessageEvent) => {
      ws.removeEventListener('message', onMessage);
      if (event.data instanceof ArrayBuffer) {
        resolve(new Uint8Array(event.data));
      } else if (event.data instanceof Uint8Array) {
        resolve(event.data);
      } else {
        resolve(null);
      }
    };
    ws.addEventListener('message', onMessage);

    // 10s handshake timeout
    setTimeout(() => {
      ws.removeEventListener('message', onMessage);
      resolve(null);
    }, 10000);
  });

  if (!firstMessage) {
    ws.close(1002, 'Handshake timeout or invalid payload');
    return;
  }

  let parsed: ParsedProtocolRequest;

  if (protocolName === 'vless') {
    parsed = parseVlessRequest(firstMessage);
    const user = await repo.getUserByVlessUuid(parsed.credentialId);
    if (!user) {
      ws.close(1008, 'Unauthorized: Unknown VLESS UUID');
      return;
    }

    const policy = evaluateUserPolicy(user, 'vless');
    if (!policy.allowed) {
      ws.close(1008, policy.reason || 'Account policy violation');
      return;
    }

    const ipPolicy = await checkAndRecordClientIp(env.KV, user.id, clientIp, user.max_ips);
    if (!ipPolicy.allowed) {
      ws.close(1008, ipPolicy.reason || 'IP limit exceeded');
      return;
    }

    // Connect to destination
    validateOutboundTarget(parsed.target.host, parsed.target.port);
    await forwardConnection(ws, parsed, user.id, repo, buildVlessResponseHeader());
  } else if (protocolName === 'trojan') {
    parsed = parseTrojanRequest(firstMessage);
    const users = await repo.listUsers();
    const user = users.find((u) => sha224(u.trojan_password).toLowerCase() === parsed.credentialId.toLowerCase());

    if (!user) {
      ws.close(1008, 'Unauthorized: Invalid Trojan password');
      return;
    }

    const policy = evaluateUserPolicy(user, 'trojan');
    if (!policy.allowed) {
      ws.close(1008, policy.reason || 'Account policy violation');
      return;
    }

    const ipPolicy = await checkAndRecordClientIp(env.KV, user.id, clientIp, user.max_ips);
    if (!ipPolicy.allowed) {
      ws.close(1008, ipPolicy.reason || 'IP limit exceeded');
      return;
    }

    validateOutboundTarget(parsed.target.host, parsed.target.port);
    await forwardConnection(ws, parsed, user.id, repo);
  } else if (protocolName === 'shadowsocks') {
    const users = await repo.listUsers();
    let authenticatedUser = null;
    let ssParsed: ParsedProtocolRequest | null = null;

    for (const u of users) {
      if (!u.enabled || !u.protocol_shadowsocks_enabled) continue;
      try {
        ssParsed = await decryptAndParseShadowsocksRequest(firstMessage, u.shadowsocks_password, u.shadowsocks_method);
        authenticatedUser = u;
        break;
      } catch {
        // Continue checking next user credentials
      }
    }

    if (!authenticatedUser || !ssParsed) {
      ws.close(1008, 'Unauthorized: Invalid Shadowsocks credentials');
      return;
    }

    const policy = evaluateUserPolicy(authenticatedUser, 'shadowsocks');
    if (!policy.allowed) {
      ws.close(1008, policy.reason || 'Account policy violation');
      return;
    }

    const ipPolicy = await checkAndRecordClientIp(env.KV, authenticatedUser.id, clientIp, authenticatedUser.max_ips);
    if (!ipPolicy.allowed) {
      ws.close(1008, ipPolicy.reason || 'IP limit exceeded');
      return;
    }

    validateOutboundTarget(ssParsed.target.host, ssParsed.target.port);
    await forwardConnection(ws, ssParsed, authenticatedUser.id, repo);
  }
}

async function forwardConnection(
  ws: WebSocket,
  req: ParsedProtocolRequest,
  userId: string,
  repo: C1Repository,
  responsePrefix?: Uint8Array
): Promise<void> {
  const socket = connect({
    hostname: req.target.host,
    port: req.target.port,
  });

  const accounting = new StreamAccounting(1024 * 1024, async (up, down) => {
    try {
      await repo.incrementUserUsage(userId, up + down);
    } catch (e) {
      console.error('[C1-ACCOUNTING] Failed to increment usage:', e);
    }
  });

  const writer = socket.writable.getWriter();

  // Send initial payload if client provided one in the first packet
  if (req.payload && req.payload.length > 0) {
    await writer.write(req.payload);
    accounting.addUpload(req.payload.byteLength);
  }

  // Forward incoming WebSocket packets to TCP socket
  ws.addEventListener('message', async (event: MessageEvent) => {
    try {
      let data: Uint8Array;
      if (event.data instanceof ArrayBuffer) {
        data = new Uint8Array(event.data);
      } else if (event.data instanceof Uint8Array) {
        data = event.data;
      } else {
        return;
      }
      await writer.write(data);
      accounting.addUpload(data.byteLength);
    } catch {
      try {
        ws.close(1011, 'Socket write error');
      } catch {}
    }
  });

  ws.addEventListener('close', async () => {
    try {
      await accounting.flush();
      await writer.close();
    } catch {}
  });

  // Pump upstream socket to WebSocket
  const reader = socket.readable.getReader();
  await pipeSocketToWebSocket(reader, ws, accounting, responsePrefix);
  await accounting.flush();
}
