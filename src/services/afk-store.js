const afk = new Map();

function normalizeJid(jid) {
  const value = String(jid || '').trim().toLowerCase();
  if (!value) return '';
  const at = value.indexOf('@');
  if (at === -1) return value;
  const local = value.slice(0, at).split(':')[0];
  return `${local}@${value.slice(at + 1)}`;
}

export function setAfk(jid, data) {
  const key = normalizeJid(jid);
  if (!key) return;
  afk.set(key, { ...data, jid: key, since: Number(data?.since) || Date.now() });
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
