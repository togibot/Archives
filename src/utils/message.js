export function getText(message) {
  const m = message?.message;
  if (!m) return '';
  return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || '';
}

export function getSender(message) {
  return message?.key?.participant || message?.key?.remoteJid || '';
}

export function getName(message) {
  return message?.pushName || getSender(message).split('@')[0] || 'Usuário';
}

export function jidToNumber(jid) {
  return jid?.split('@')[0] || '';
}
