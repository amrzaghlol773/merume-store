type LoginAttempt = {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number;
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

const attempts = new Map<string, LoginAttempt>();

function now() {
  return Date.now();
}

function getOrInitAttempt(key: string) {
  const existing = attempts.get(key);
  if (existing) {
    return existing;
  }

  const initial: LoginAttempt = {
    count: 0,
    firstAttemptAt: now(),
    blockedUntil: 0,
  };
  attempts.set(key, initial);
  return initial;
}

export function getLoginThrottleState(key: string) {
  const entry = getOrInitAttempt(key);
  const current = now();

  if (entry.blockedUntil > current) {
    return {
      blocked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.blockedUntil - current) / 1000)),
    };
  }

  if (current - entry.firstAttemptAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAttemptAt = current;
    entry.blockedUntil = 0;
  }

  return {
    blocked: false,
    retryAfterSeconds: 0,
  };
}

export function registerFailedLoginAttempt(key: string) {
  const entry = getOrInitAttempt(key);
  const current = now();

  if (current - entry.firstAttemptAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAttemptAt = current;
    entry.blockedUntil = 0;
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = current + BLOCK_MS;
    return {
      blocked: true,
      retryAfterSeconds: Math.max(1, Math.ceil(BLOCK_MS / 1000)),
    };
  }

  return {
    blocked: false,
    retryAfterSeconds: 0,
  };
}

export function resetLoginAttempts(key: string) {
  attempts.delete(key);
}
