export function normalizeHostCandidate(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (value.startsWith('[') && value.includes(']')) return value.slice(1, value.indexOf(']'));
  const colonCount = (value.match(/:/g) || []).length;
  if (colonCount === 1 && value.includes('.')) return value.split(':')[0];
  return value;
}

function parseIPv4(host: string): number[] | null {
  const parts = host.split('.');
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

export function isBlockedDestination(hostname: string, port: number): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || port < 1 || port > 65535) return true;
  if ([25, 445].includes(port)) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host === '::1' || host === '0:0:0:0:0:0:0:1') return true;
  if (host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) return true;

  const ip = parseIPv4(host);
  if (!ip) return false;
  const [a, b] = ip;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}

export function parseCleanTargets(raw: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of raw.split(/[\r\n,;]+/)) {
    const item = line.trim();
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= 50) break;
  }
  return out;
}
