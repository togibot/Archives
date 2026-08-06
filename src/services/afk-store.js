const afk = new Map();

export function setAfk(jid, data) {
  afk.set(jid, data);
}

export function getAfk(jid) {
  return afk.get(jid);
}

export function clearAfk(jid) {
  afk.delete(jid);
}

export function hasAfk(jid) {
  return afk.has(jid);
}

export function getAllAfk() {
  return afk;
}
