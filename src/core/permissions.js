import config from '../config.js';

export function isOwner(jid) {
  const number = jid?.split('@')[0];
  return Boolean(number && config.owner.numbers.includes(number));
}

export async function getGroupRole(sock, chat, jid) {
  if (!chat?.endsWith('@g.us')) return 'user';
  const metadata = await sock.groupMetadata(chat);
  const participant = metadata.participants.find(p => p.id === jid || p.phoneNumber === jid);
  if (!participant) return 'user';
  if (participant.admin === 'superadmin') return 'group-owner';
  if (participant.admin === 'admin') return 'admin';
  return 'user';
}

export async function getPermissionLevel({ sock, chat, jid }) {
  if (isOwner(jid)) return 5;
  const role = await getGroupRole(sock, chat, jid);
  if (role === 'group-owner') return 4;
  if (role === 'admin') return 3;
  return 1;
}
