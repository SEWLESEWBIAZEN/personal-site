// In-memory fixed-window limiter. Sufficient for a single-instance deployment;
// swap for Redis or similar if the app is scaled horizontally.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count++;
  return { ok: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_PER_ACCOUNT = 5; // per IP + email
const LOGIN_MAX_PER_IP = 20; // across all emails from one IP

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

/**
 * Applied inside the credentials provider so every sign-in path (the login
 * form's server action and a direct POST to /api/auth/callback/credentials)
 * is limited.
 */
export function checkLoginRateLimit(ip: string, email: string) {
  const account = rateLimit(`login:${ip}:${email}`, LOGIN_MAX_PER_ACCOUNT, LOGIN_WINDOW_MS);
  const perIp = rateLimit(`login-ip:${ip}`, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS);
  return account.ok && perIp.ok;
}

export function resetLoginRateLimit(ip: string, email: string) {
  resetRateLimit(`login:${ip}:${email}`);
}
