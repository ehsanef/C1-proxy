/**
 * Karing-optimized subscription output.
 * Karing handles both standard base64 URIs and custom headers seamlessly.
 */

import { NodeConfigOptions } from './uri';
import { generateBase64Subscription } from './base64';

export function generateKaringSubscription(nodeOptions: NodeConfigOptions[]): string {
  return generateBase64Subscription(nodeOptions);
}
