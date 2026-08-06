export function getMentionedJid(message) {
  const ctx = message.message?.extendedTextMessage?.contextInfo || message.message?.imageMessage?.contextInfo || message.message?.videoMessage?.contextInfo;
  return ctx?.mentionedJid?.[0] || ctx?.participant || null;
}

export function cleanMention(jid) {
  return jid ? `@${jid.split('@')[0]}` : '@usuário';
}
