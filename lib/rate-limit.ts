interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number; // tokens per second
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now - entry.lastRefill > windowMs) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  cleanup(config.windowMs);

  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: config.maxTokens, lastRefill: now };
    store.set(key, entry);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - entry.lastRefill) / 1000;
  entry.tokens = Math.min(config.maxTokens, entry.tokens + elapsed * config.refillRate);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const retryAfter = Math.ceil((1 - entry.tokens) / config.refillRate);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.tokens -= 1;
  return { allowed: true, remaining: Math.floor(entry.tokens) };
}

// Preset configurations
export const rateLimits = {
  auth: { maxTokens: 10, refillRate: 10 / 60, windowMs: 60_000 } as RateLimitConfig,
  generateNarrative: { maxTokens: 20, refillRate: 20 / 60, windowMs: 60_000 } as RateLimitConfig,
  generateSummary: { maxTokens: 10, refillRate: 10 / 60, windowMs: 60_000 } as RateLimitConfig,
};
