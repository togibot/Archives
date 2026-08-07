import { getPermissionLevel } from '../core/permissions.js';

const settings = new Map();
const customWords = new Map();

// Lista base. A comparação abaixo também aceita acentos, pontuação,
// separadores e algumas substituições comuns de caracteres.
const DEFAULT_WORDS = [
  'caralho', 'porra', 'merda', 'puta', 'puto', 'putaria', 'foder', 'foda',
  'fodase', 'fdp', 'filhodaputa', 'desgraca', 'desgraça', 'cu', 'cuzão',
  'cusao', 'viado', 'viada', 'buceta', 'piranha', 'vagabunda', 'vagabundo',
  'arrombado', 'arrombada', 'cacete', 'corno', 'otario', 'otária', 'otario',
  'idiota', 'imbecil'
];

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/(.)\1{2,}/g, '$1');
}

function compact(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, '');
}

function getWords(chat) {
  const custom = customWords.get(chat) || [];
  return [...DEFAULT_WORDS, ...custom];
}

export function isAntiProfanityEnabled(chat) {
  return Boolean(chat && settings.get(chat));
}

export function setAntiProfanity(chat, enabled) {
  if (!chat) return;
  settings.set(chat, Boolean(enabled));
}

export function setCustomWords(chat, words) {
  if (!chat) return;
  customWords.set(chat, words.map(word => compact(word)).filter(Boolean));
}

export function findProfanity(text, chat) {
  if (!isAntiProfanityEnabled(chat)) return null;
  const normalized = compact(text);
  if (!normalized) return null;

  for (const word of getWords(chat)) {
    const target = compact(word);
    if (target && normalized.includes(target)) return target;
  }
  return null;
}

export async function moderateProfanity({ sock, chat, message, sender }) {
  if (!chat?.endsWith('@g.us')) return false;
  const text = message?.message?.conversation
    || message?.message?.extendedTextMessage?.text
    || message?.message?.imageMessage?.caption
    || message?.message?.videoMessage?.caption
    || '';
  if (!findProfanity(text, chat)) return false;

  // O próprio WhatsApp impede remover administradores. Também evitamos
  // que o anti-palavrão tente remover o dono/admin do grupo.
  const senderLevel = await getPermissionLevel({ sock, chat, jid: sender }).catch(() => 1);
  if (senderLevel >= 3) return false;

  const botJid = sock?.user?.id;
  const botLevel = await getPermissionLevel({ sock, chat, jid: botJid }).catch(() => 1);
  if (botLevel < 3) return false;

  try {
    await sock.groupParticipantsUpdate(chat, [sender], 'remove');
    return true;
  } catch {
    return false;
  }
}

export default {
  isAntiProfanityEnabled,
  setAntiProfanity,
  setCustomWords,
  findProfanity,
  moderateProfanity
};
