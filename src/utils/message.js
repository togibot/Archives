function unwrapMessageContent(message) {
  let content = message?.message;
  if (!content) return null;
  for (let i = 0; i < 5 && content; i++) {
    if (content.ephemeralMessage?.message) { content = content.ephemeralMessage.message; continue; }
    if (content.viewOnceMessage?.message) { content = content.viewOnceMessage.message; continue; }
    if (content.viewOnceMessageV2?.message) { content = content.viewOnceMessageV2.message; continue; }
    break;
  }
  return content;
}

export function getText(message) {
  const m = unwrapMessageContent(message);
  if (!m) return '';
  return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || m.documentMessage?.caption || '';
}

export function getSenderCandidates(message) {
  const key = message?.key || {};
  return [
    key.participantPn,
    key.senderPn,
    key.participant,
    key.remoteJidAlt,
    key.remoteJid,
    message?.participantPn,
    message?.senderPn,
    message?.participant,
    message?.sender?.phoneNumber,
    message?.sender?.id
  ].filter(Boolean);
}

export function getSender(message) {
  const candidates = getSenderCandidates(message);
  return candidates[0] || '';
}

export function getName(message) {
  return message?.pushName || getSender(message).split('@')[0] || 'Usuário';
}

export function jidToNumber(jid) {
  return jid?.split('@')[0] || '';
}
