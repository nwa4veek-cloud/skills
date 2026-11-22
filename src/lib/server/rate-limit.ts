const requests = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (requests.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    requests.set(key, recent);
    return true;
  }
  if (!requests.has(key) && requests.size >= 2_000) {
    for (const [storedKey, timestamps] of requests) {
      if (timestamps.every((timestamp) => now - timestamp >= windowMs)) requests.delete(storedKey);
    }
    if (requests.size >= 2_000) return true;
  }

  recent.push(now);
  requests.set(key, recent);
  return false;
}

export function getRequestKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
