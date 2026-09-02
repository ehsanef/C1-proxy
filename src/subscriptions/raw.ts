/**
 * Raw subscription generator (newline-separated URIs).
 */

import { NodeConfigOptions, buildVlessUri, buildTrojanUri, buildShadowsocksUri } from './uri';

export function generateRawSubscription(nodeOptions: NodeConfigOptions[]): string {
  const lines: string[] = [];

  for (const opt of nodeOptions) {
    const proto = opt.inbound.protocol;
    if (proto === 'vless' && opt.user.protocol_vless_enabled) {
      lines.push(buildVlessUri(opt));
    } else if (proto === 'trojan' && opt.user.protocol_trojan_enabled) {
      lines.push(buildTrojanUri(opt));
    } else if (proto === 'shadowsocks' && opt.user.protocol_shadowsocks_enabled) {
      lines.push(buildShadowsocksUri(opt));
    }
  }

  return lines.join('\n');
}
