const afk = new Map();

function normalizeJid(jid) {
  return String(jid || '').trim();
}

export function setAfk(jid, data) {
  const key = normalizeJid(jid);
  if (!key) return;
  afk.set(key, { ...data, jid: key });
}

export function getAfk(jid) {
  return afk.get(normalizeJid(jid));
}

export function clearAfk(jid) {
  return afk.delete(normalizeJid(jid));
}

export function hasAfk(jid) {
  return afk.has(normalizeJid(jid));
}

export function getAllAfk() {
  return afk;
}
