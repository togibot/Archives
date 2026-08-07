import { getPermissionLevel } from '../core/permissions.js';
import { getGroup, updateGroup } from '../database/index.js';

const DEFAULT_WORDS = [
  'caralho', 'porra', 'merda', 'puta', 'puto', 'putaria', 'foder', 'foda',
  'fodase', 'fdp', 'filhodaputa', 'desgraca', 'cuzão', 'cusao', 'viado',
  'viada', 'buceta', 'piranha', 'vagabunda', 'vagabundo', 'arrombado',
  'arrombada', 'cacete', 'corno', 'otario', 'otaria', 'idiota', 'imbecil'
];

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[9]/g, 'g')
    .replace(/(.)\1{2,}/g, '$1');
}

function compact(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, '');
}

function readCustomWords(group) {
  try {
    const words = JSON.parse(group?.profanity_words || '[]');
    return Array.isArray(words) ? words.map(compact).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getWords(chat) {
  const group = getGroup(chat);
  return [...DEFAULT_WORDS, ...readCustomWords(group)];
}

export function isAntiProfanityEnabled(chat) {
  return Boolean(getGroup(chat)?.anti_profanity);
}

export function setAntiProfanity(chat, enabled) {
  if (!chat) return;
  updateGroup(chat, { anti_profanity: enabled ? 1 : 0 });
}

export function setCustomWords(chat, words) {
  if (!chat) return;
  const normalized = [...new Set((words || []).map(compact).filter(Boolean))];
  updateGroup(chat, { profanity_words: JSON.stringify(normalized) });
}

export function getCustomWords(chat) {
  return readCustomWords(getGroup(chat));
}

export function findProfanity(text, chat) {
  if (!isAntiProfanityEnabled(chat)) return null;
  const normalized = compact(text);
  if (!normalized) return null;

  for (const word of getWords(chat)) {
    if (word.length <= 2) {
      if (normalized === word) return word;
      continue;
    }
    if (normalized.includes(word)) return word;
  }
  return null;
}

function getMessageText(message) {
  return message?.message?.conversation
    || message?.message?.extendedTextMessage?.text
    || message?.message?.imageMessage?.caption
    || message?.message?.videoMessage?.caption
    || '';
}

export async function moderateProfanity({ sock, chat, message, sender }) {
  if (!chat?.endsWith('@g.us')) return false;
  const found = findProfanity(getMessageText(message), chat);
  if (!found) return false;

  const senderLevel = await getPermissionLevel({ sock, chat, jid: sender }).catch(() => 1);
  if (senderLevel >= 3) return false;

  const botLevel = await getPermissionLevel({ sock, chat, jid: sock?.user?.id }).catch(() => 1);
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
  getCustomWords,
  findProfanity,
  moderateProfanity
};
