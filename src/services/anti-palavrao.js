import { getGroup, updateGroup } from '../database/index.js';
import { getText } from '../utils/message.js';

const DEFAULT_WORDS = [
  'caralho','carai','porra','p0rra','p0rr4','merda','m3rda','puta','put4','puto','put0','putaria',
  'foda','f0da','fodase','foda-se','f0d4s3','foder','fodeu','fodendo','fuder','fudido','fudida','fudendo',
  'fdp','f.d.p','filho da puta','filha da puta','filhodaputa','filhadaputa','desgraca','desgraça','desgraçado',
  'desgraçada','d3sgraça','cacete','c4cete','buceta','bucet4','boceta','xoxota','xota','cu','cú','cuzao','cuzão',
  'cuzinho','cuzada','cuzudo','bunda','bundão','bundao','bosta','bost4','viado','vi4do','viadinho','viadão',
  'boiola','bicha','baitola','piranha','piranh4','vagabunda','vagabundo','arrombado','arrombada','arromb4do',
  'corno','corn0','cornudo','otario','otária','otaria','0tario','idiota','idiot4','imbecil','burro','burra','babaca',
  'babac4','retardado','retardada','nojento','nojenta','escroto','escrota','canalha','safado','safada','maldito',
  'maldita','cretino','cretina','palhaço','palhaco','palhaça','palhaca','trouxa','troux4','mané','mane','estupido',
  'estúpido','estupida','estúpida','vai tomar no cu','vai tomar no cú','vtc','vtnc','vai se foder','vai se fuder',
  'vsf','tomar no cu','tomar no cú','tomarnocu','tnc','se fode','se fuder','se foder','puta que pariu','pqp',
  'p.q.p','vpqp','filho de uma puta','filha de uma puta','caralho velho','porra nenhuma','merda nenhuma','que merda',
  'que porra','que caralho','vai à merda','vai a merda','vai pra merda','inferno','diabo','diabos','demonio','demônio',
  'satanas','satanás','sacanagem','sacana','sacanear','fml','krl','krlh','crlh','prr','mrd','bct','bct4','p0rr4',
  'c4r4lh0','c4r4lho','f0d4','f0d4r','f0d3r','fud3u','fud3ndo','put4','put0','buc3t4','cuz4o','vi4d0','p1r4nh4',
  'v4g4bund0','4rromb4d0','0t4ri0','1mb3c1l','b4b4c4','p4lh4c0','m4ld1t0','d3m0n10','escrot0','s4f4d0','s4c4n4',
  'c4c3t3','b0st4','m3rd4'
];

function normalize(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[@4]/g, 'a').replace(/3/g, 'e').replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o').replace(/[5$]/g, 's').replace(/7/g, 't')
    .replace(/8/g, 'b').replace(/9/g, 'g').replace(/(.)\1{2,}/g, '$1');
}

function compact(value) { return normalize(value).replace(/[^a-z0-9]+/g, ''); }

function readCustomWords(group) {
  try {
    const words = JSON.parse(group?.profanity_words || '[]');
    return Array.isArray(words) ? words.map(compact).filter(Boolean) : [];
  } catch { return []; }
}

function getWords(chat) {
  return [...DEFAULT_WORDS, ...readCustomWords(getGroup(chat))];
}

export function isAntiProfanityEnabled(chat) { return Boolean(getGroup(chat)?.anti_profanity); }

export function setAntiProfanity(chat, enabled) {
  if (chat) updateGroup(chat, { anti_profanity: enabled ? 1 : 0 });
}

export function setCustomWords(chat, words) {
  if (chat) updateGroup(chat, { profanity_words: JSON.stringify([...new Set((words || []).map(compact).filter(Boolean))]) });
}

export function getCustomWords(chat) { return readCustomWords(getGroup(chat)); }

export function findProfanity(text, chat) {
  if (!isAntiProfanityEnabled(chat)) return null;
  const normalized = compact(text);
  if (!normalized) return null;
  for (const word of getWords(chat)) {
    const compactWord = compact(word);
    if (compactWord.length <= 2 ? normalized === compactWord : normalized.includes(compactWord)) return compactWord;
  }
  return null;
}

function normalizeJid(jid) {
  return String(jid || '').split(':')[0].split('@')[0].replace(/\D/g, '');
}

async function isBotAdmin(sock, chat) {
  try {
    const metadata = await sock.groupMetadata(chat);
    const botIds = [sock?.user?.id, sock?.user?.jid, sock?.user?.phoneNumber].map(normalizeJid).filter(Boolean);
    return metadata.participants.some((participant) => {
      const ids = [participant?.id, participant?.phoneNumber].map(normalizeJid).filter(Boolean);
      return ids.some((id) => botIds.includes(id)) && ['admin', 'superadmin'].includes(participant?.admin);
    });
  } catch { return false; }
}

function buildDeleteKey(chat, message) {
  const key = message?.key || {};
  return {
    remoteJid: key.remoteJid || chat,
    id: key.id,
    fromMe: Boolean(key.fromMe),
    ...(key.participant ? { participant: key.participant } : {}),
    ...(key.participantAlt ? { participantAlt: key.participantAlt } : {})
  };
}

function maskWord(word) {
  const value = String(word || '');
  if (value.length <= 2) return '••';
  return `${value[0]}${'•'.repeat(Math.min(value.length - 2, 12))}${value.at(-1)}`;
}

export async function moderateProfanity({ sock, chat, message }) {
  if (!chat?.endsWith('@g.us')) return { moderated: false };
  if (!isAntiProfanityEnabled(chat)) return { moderated: false };

  const text = getText(message);
  const found = findProfanity(text, chat);
  if (!found) return { moderated: false };

  console.log(`\n🛡️ [ANTI-PALAVRÃO] Mensagem detectada!`);
  console.log(`👤 Autor: ${message?.key?.participant || 'desconhecido'}`);
  console.log(`💬 Palavra detectada: ${maskWord(found)}`);

  const botAdmin = await isBotAdmin(sock, chat);
  console.log(`🤖 Togi é ADM: ${botAdmin ? 'SIM ✅' : 'NÃO ❌'}`);

  if (!botAdmin) return { moderated: false, reason: 'bot-not-admin', word: found };

  const deleteKey = buildDeleteKey(chat, message);
  console.log(`🆔 ID da mensagem: ${deleteKey.id || 'ausente'}`);
  if (!deleteKey.id) {
    console.log(`🗑️ Exclusão: FALHOU ❌ (ID da mensagem ausente)`);
    return { moderated: false, reason: 'missing-message-id', word: found };
  }

  try {
    await sock.sendMessage(chat, { delete: deleteKey });
    console.log(`🗑️ Exclusão: SUCESSO ✅`);
    return { moderated: true, word: found, testMode: true };
  } catch (error) {
    console.log(`🗑️ Exclusão: FALHOU ❌`);
    console.log(`❌ Erro: ${error?.message || String(error)}`);
    return { moderated: false, reason: 'delete-failed', word: found, error: error?.message || String(error) };
  }
}

export default { isAntiProfanityEnabled, setAntiProfanity, setCustomWords, getCustomWords, findProfanity, moderateProfanity };
