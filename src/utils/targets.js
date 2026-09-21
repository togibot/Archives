function normalize(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  return raw.split('@')[0].split(':')[0];
}
function asJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  return raw.split(':')[0] + '@s.whatsapp.net';
}
export function getMentionedJid(message) {
  const ctx = message?.message?.extendedTextMessage?.contextInfo || message?.message?.imageMessage?.contextInfo || message?.message?.videoMessage?.contextInfo || message?.message?.documentMessage?.contextInfo;
  return ctx?.mentionedJid?.[0] || ctx?.participant || null;
}
export function cleanMention(jid) {
  return jid ? '@' + String(jid).split('@')[0] : '@usuário';
}
export async function resolveTargetJid({ sock, chat, message }) {
  const raw = getMentionedJid(message);
  if (!raw) return null;
  if (!sock || !chat?.endsWith('@g.us')) return asJid(raw);
  try {
    const metadata = await sock.groupMetadata(chat);
    const wanted = normalize(raw);
    const participant = metadata?.participants?.find(p => [p?.id,p?.jid,p?.lid,p?.phoneNumber,p?.participant].map(normalize).filter(Boolean).includes(wanted));
    return asJid(participant?.phoneNumber || participant?.jid || participant?.id || participant?.lid || raw);
  } catch {
    return asJid(raw);
  }
}
