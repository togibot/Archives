import { getAllAfk, clearAfk } from '../services/afk-store.js';

export function getAfkNotice(jid) {
  const entry = getAllAfk().get(jid);
  if (!entry) return null;
  clearAfk(jid);
  const elapsedMs = Math.max(0, Date.now() - entry.since);
  const minutes = Math.floor(elapsedMs / 60000);
  return `💤 @${jid.split('@')[0]} voltou do AFK após ${minutes} min.\n📝 Motivo anterior: ${entry.reason}`;
}
