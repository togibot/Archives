import config from '../config.js';

function normalize(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const local = raw.split('@')[0].split(':')[0];
  return local.replace(/\D/g, '');
}
function asJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  return raw.split(':')[0] + '@s.whatsapp.net';
}
function flatten(values) {
  return values.flatMap(value => Array.isArray(value) ? value : [value]).map(normalize).filter(Boolean);
}
export function isOwner(...values) {
  const allowed = new Set(config.owner.numbers.map(normalize).filter(Boolean));
  return allowed.size > 0 && flatten(values).some(number => allowed.has(number));
}
export function getIdentityCandidates(message, jid = '') {
  const key = message?.key || {};
  return [jid,key.participant,key.participantAlt,key.participantPn,key.senderPn,key.remoteJid,key.remoteJidAlt,message?.participant,message?.participantAlt,message?.senderPn,message?.sender?.id,message?.sender?.phoneNumber].filter(Boolean);
}
export function isOwnerMessage(message, jid = '') {
  return isOwner(getIdentityCandidates(message, jid));
}
export function resolveOwnerJid(message, jid = '') {
  const allowed = new Set(config.owner.numbers.map(normalize).filter(Boolean));
  const candidates = getIdentityCandidates(message, jid);
  const preferred = candidates.find(value => String(value).toLowerCase().includes('@s.whatsapp.net') && allowed.has(normalize(value)));
  return asJid(preferred || candidates.find(value => allowed.has(normalize(value))) || jid);
}
function participantValues(participant) {
  return [participant?.id,participant?.jid,participant?.lid,participant?.phoneNumber,participant?.participant];
}
export async function getGroupRole(sock, chat, jid, message = null) {
  if (!chat?.endsWith('@g.us')) return 'user';
  const metadata = await sock.groupMetadata(chat);
  const wanted = new Set(flatten(getIdentityCandidates(message, jid)));
  const participant = metadata?.participants?.find(p => participantValues(p).some(value => wanted.has(normalize(value))));
  if (!participant) return 'user';
  if (participant.admin === 'superadmin') return 'group-owner';
  if (participant.admin === 'admin') return 'admin';
  return 'user';
}
export async function getPermissionLevel({ sock, chat, jid, message = null }) {
  if (isOwnerMessage(message, jid) || isOwner(jid)) return 5;
  const role = await getGroupRole(sock, chat, jid, message);
  if (role === 'group-owner') return 4;
  if (role === 'admin') return 3;
  return 1;
}
