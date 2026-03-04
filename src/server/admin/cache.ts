const adminCache = new Map<
  string,
  {
    expiresAt: number;
    payload: unknown;
  }
>();

export const getFromCache = (key: string) => {
  const cached = adminCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    adminCache.delete(key);
    return null;
  }
  return cached.payload;
};

export const setCache = (key: string, payload: unknown, ttlMs: number) => {
  adminCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    payload,
  });
};
