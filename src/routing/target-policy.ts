/**
 * Outbound target validation and policy checks.
 * Prevents SSRF attacks into Cloudflare internal networks and RFC 1918 private subnets.
 */

import { isPrivateIp, isValidDomain, isValidIpv4, isValidIpv6, isValidPort } from '../utils/validation';
import { C1Error, ErrorCode } from '../app/errors';

// Disallowed ports for security / spam prevention
const BLOCKED_PORTS = new Set([25, 465, 587]); // SMTP ports blocked by default

export function validateOutboundTarget(host: string, port: number): void {
  if (!isValidPort(port)) {
    throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Invalid target port: ${port}`, 400);
  }

  if (BLOCKED_PORTS.has(port)) {
    throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Port ${port} is blocked by policy`, 403);
  }

  if (isValidIpv4(host)) {
    if (isPrivateIp(host)) {
      throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Connection to private IP ${host} is forbidden`, 403);
    }
  } else if (isValidDomain(host)) {
    const lower = host.toLowerCase();
    if (
      lower === 'localhost' ||
      lower.endsWith('.local') ||
      lower.endsWith('.internal') ||
      lower.endsWith('.onion')
    ) {
      throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Target domain ${host} is disallowed`, 403);
    }
  } else if (!isValidIpv6(host)) {
    throw new C1Error(ErrorCode.NET_TARGET_BLOCKED, `Invalid target host: ${host}`, 400);
  }
}
