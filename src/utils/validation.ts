/**
 * Input validation helpers for C1 Proxy
 */

export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_-]{3,32}$/.test(username);
}

export function isValidUuid(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function isValidIpv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255 && (part === '0' || !part.startsWith('0'));
  });
}

export function isValidIpv6(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip) || ip.includes('::');
}

export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  if (domain.length > 253) return false;
  return /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain);
}

export function isValidHost(host: string): boolean {
  return isValidIpv4(host) || isValidIpv6(host) || isValidDomain(host);
}

/**
 * Checks if target IP address is a private/internal RFC1918 or loopback address.
 * Prevents SSRF / edge pivot attacks.
 */
export function isPrivateIp(ip: string): boolean {
  if (!isValidIpv4(ip)) return false;
  const parts = ip.split('.').map(Number);
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 127.0.0.0/8
  if (parts[0] === 127) return true;
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (link local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 0.0.0.0/8
  if (parts[0] === 0) return true;
  return false;
}
