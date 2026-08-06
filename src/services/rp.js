const pending = new Map();
const EXPIRATION_MS = 5 * 60 * 1000;

function key(target, requester) {
  return `${target}::${requester}`;
}

export function createDatingRequest(requester, target) {
  pending.set(key(target, requester), { requester, target, createdAt: Date.now() });
}

export function consumeDatingRequest(target, requester) {
  const id = key(target, requester);
  const request = pending.get(id);
  if (!request) return false;
  pending.delete(id);
  if (Date.now() - request.createdAt > EXPIRATION_MS) return false;
  return true;
}
