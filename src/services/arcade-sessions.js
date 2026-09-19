const sessions = new Map();

export function setArcadeSession(jid, data, ttlMs = 120000, onExpire = null) {
  const expiresAt = Date.now() + ttlMs;
  sessions.set(jid, { ...data, expiresAt });

  setTimeout(async () => {
    const current = sessions.get(jid);
    if (current?.expiresAt !== expiresAt) return;

    sessions.delete(jid);

    if (typeof onExpire === 'function') {
      try {
        await onExpire(current);
      } catch {
        // A session expiration notification must never crash the bot.
      }
    }
  }, ttlMs + 50);
}

export function getArcadeSession(jid) {
  const session = sessions.get(jid);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(jid);
    return null;
  }

  return session;
}

export function clearArcadeSession(jid) {
  sessions.delete(jid);
}
