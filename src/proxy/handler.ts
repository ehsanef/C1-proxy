import { connect } from 'cloudflare:sockets';
import type { Env, UserRecord } from '../types';
import { addUsage, userIsAllowed } from '../database/repo';
import { timingSafeEqual } from '../auth/crypto';
import { base64UrlDecodeBytes } from '../utils/encoding';
import { isBlockedDestination } from '../utils/network';
import { parseVlessRequest } from './vless';

function toBytes(data: unknown): Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  throw new Error('Unsupported WebSocket payload');
}

function earlyDataFromRequest(request: Request): Uint8Array | null {
  const header = request.headers.get('sec-websocket-protocol') || '';
  if (!header || header.includes(',') || /^(chat|graphql|binary)$/i.test(header)) return null;
  try {
    const bytes = base64UrlDecodeBytes(header.trim());
    return bytes.length >= 24 ? bytes : null;
  } catch {
    return null;
  }
}

export async function handleVlessWebSocket(request: Request, env: Env, ctx: ExecutionContext, user: UserRecord): Promise<Response> {
  const allowed = userIsAllowed(user);
  if (!allowed.ok) return new Response('Forbidden', { status: 403 });
  if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return new Response('Upgrade required', { status: 426 });

  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
  server.accept();
  server.binaryType = 'arraybuffer';

  let remote: Socket | null = null;
  let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  let initialized = false;
  let closed = false;
  let up = 0;
  let down = 0;
  let serial: Promise<void> = Promise.resolve();

  const finish = () => {
    if (closed) return;
    closed = true;
    try { writer?.releaseLock(); } catch {}
    try { remote?.close(); } catch {}
    try { server.close(); } catch {}
    ctx.waitUntil(addUsage(env, user.id, up, down).catch(() => {}));
  };

  const startRemotePump = async () => {
    if (!remote) return;
    const reader = remote.readable.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
        down += chunk.byteLength;
        server.send(chunk);
      }
    } catch {
      // connection ended
    } finally {
      try { reader.releaseLock(); } catch {}
      finish();
    }
  };

  const processChunk = async (bytes: Uint8Array) => {
    if (!initialized) {
      const parsed = parseVlessRequest(bytes);
      if (!timingSafeEqual(parsed.uuid.toLowerCase(), user.uuid.toLowerCase())) throw new Error('Bad UUID');
      if (parsed.command !== 1) throw new Error('Only TCP is supported in C1 0.1');
      if (isBlockedDestination(parsed.address, parsed.port)) throw new Error('Destination blocked');
      remote = connect({ hostname: parsed.address, port: parsed.port });
      writer = remote.writable.getWriter();
      initialized = true;
      server.send(new Uint8Array([parsed.version, 0]));
      const payload = bytes.subarray(parsed.payloadOffset);
      if (payload.byteLength) {
        up += payload.byteLength;
        await writer.write(payload);
      }
      ctx.waitUntil(startRemotePump());
      return;
    }
    if (!writer) throw new Error('Remote writer unavailable');
    up += bytes.byteLength;
    await writer.write(bytes);
  };

  server.addEventListener('message', (event) => {
    serial = serial.then(() => processChunk(toBytes(event.data))).catch(() => finish());
  });
  server.addEventListener('close', finish);
  server.addEventListener('error', finish);

  const early = earlyDataFromRequest(request);
  if (early) serial = serial.then(() => processChunk(early)).catch(() => finish());

  const responseHeaders = new Headers();
  const protocolHeader = request.headers.get('sec-websocket-protocol');
  if (protocolHeader && !protocolHeader.includes(',')) responseHeaders.set('sec-websocket-protocol', protocolHeader);
  return new Response(null, { status: 101, webSocket: client, headers: responseHeaders } as ResponseInit);
}
