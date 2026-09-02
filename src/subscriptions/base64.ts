/**
 * Standard Base64 subscription generator for v2rayNG, Shadowrocket, and generic clients.
 */

import { bytesToBase64, stringToBytes } from '../utils/bytes';
import { NodeConfigOptions } from './uri';
import { generateRawSubscription } from './raw';

export function generateBase64Subscription(nodeOptions: NodeConfigOptions[]): string {
  const raw = generateRawSubscription(nodeOptions);
  return bytesToBase64(stringToBytes(raw));
}
