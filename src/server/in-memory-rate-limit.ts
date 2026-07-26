type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type InMemoryRateLimiterOptions = {
  maxAttempts: number;
  maxEntries?: number;
  windowMs: number;
};

export type RateLimitResult =
  | {
      ok: true;
      remaining: number;
      resetAt: number;
    }
  | {
      ok: false;
      retryAfterSeconds: number;
      resetAt: number;
    };

export class InMemoryRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly maxEntries: number;
  private readonly windowMs: number;

  constructor({ maxAttempts, maxEntries = 5_000, windowMs }: InMemoryRateLimiterOptions) {
    this.maxAttempts = maxAttempts;
    this.maxEntries = maxEntries;
    this.windowMs = windowMs;
  }

  peek(key: string, now = Date.now()): RateLimitResult {
    this.prune(now);
    const entry = this.entries.get(key);

    if (!entry) {
      return { ok: true, remaining: this.maxAttempts, resetAt: now + this.windowMs };
    }

    if (entry.resetAt <= now) {
      this.entries.delete(key);
      return { ok: true, remaining: this.maxAttempts, resetAt: now + this.windowMs };
    }

    if (entry.count > this.maxAttempts) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
        resetAt: entry.resetAt,
      };
    }

    return {
      ok: true,
      remaining: Math.max(0, this.maxAttempts - entry.count),
      resetAt: entry.resetAt,
    };
  }

  consume(key: string, now = Date.now()): RateLimitResult {
    this.prune(now);
    const existing = this.entries.get(key);

    if (!existing || existing.resetAt <= now) {
      const next = { count: 1, resetAt: now + this.windowMs };
      this.entries.set(key, next);
      this.enforceMaxEntries();
      return {
        ok: true,
        remaining: Math.max(0, this.maxAttempts - next.count),
        resetAt: next.resetAt,
      };
    }

    existing.count += 1;
    this.entries.set(key, existing);

    if (existing.count > this.maxAttempts) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        resetAt: existing.resetAt,
      };
    }

    return {
      ok: true,
      remaining: Math.max(0, this.maxAttempts - existing.count),
      resetAt: existing.resetAt,
    };
  }

  reset(key: string) {
    this.entries.delete(key);
  }

  resetAll() {
    this.entries.clear();
  }

  private prune(now: number) {
    for (const [key, entry] of this.entries) {
      if (entry.resetAt <= now) {
        this.entries.delete(key);
      }
    }
  }

  private enforceMaxEntries() {
    if (this.entries.size <= this.maxEntries) return;

    const overflow = this.entries.size - this.maxEntries;
    let removed = 0;
    for (const key of this.entries.keys()) {
      this.entries.delete(key);
      removed += 1;
      if (removed >= overflow) break;
    }
  }
}
