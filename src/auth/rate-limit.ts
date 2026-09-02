/**
 * Sliding window rate limiter for login attempts and sensitive endpoints.
 * Uses KV if available, with in-memory fallback.
 */

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  kv: KVNamespace | undefined,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Math.floor(Date.now() / 1000);

  if (kv) {
    try {
      const kvKey = `rl:${key}`;
      const recordStr = await kv.get(kvKey);
      let count = 0;
      let expiresAt = now + windowSeconds;

      if (recordStr) {
        const parsed = JSON.parse(recordStr) as { count: number; expiresAt: number };
        if (parsed.expiresAt > now) {
          count = parsed.count;
          expiresAt = parsed.expiresAt;
        }
      }

      if (count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetIn: Math.max(1, expiresAt - now),
        };
      }

      count += 1;
      await kv.put(kvKey, JSON.stringify({ count, expiresAt }), {
        expirationTtl: Math.max(60, windowSeconds),
      });

      return {
        allowed: true,
        remaining: limit - count,
        resetIn: Math.max(1, expiresAt - now),
      };
    } catch {
      // Fallback to in-memory store if KV fails
    }
  }

  // In-memory fallback
  const mem = memoryStore.get(key);
  if (mem && mem.resetAt > now) {
    if (mem.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.max(1, mem.resetAt - now),
      };
    }
    mem.count += 1;
    return {
      allowed: true,
      remaining: limit - mem.count,
      resetIn: Math.max(1, mem.resetAt - now),
    };
  }

  const resetAt = now + windowSeconds;
  memoryStore.set(key, { count: 1, resetAt });

  // Clean memory store periodically
  if (memoryStore.size > 2000) {
    for (const [k, v] of memoryStore.entries()) {
      if (v.resetAt <= now) {
        memoryStore.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: limit - 1,
    resetIn: windowSeconds,
  };
}
