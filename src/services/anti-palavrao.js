import { getGroup, updateGroup } from '../database/index.js';

// Dicionário amplo do Togi: palavrões, abreviações, leetspeak e variações comuns.
// A comparação passa por normalize() + compact(), então espaços, acentos e alguns
// caracteres usados para mascarar palavras também são tratados.
const DEFAULT_WORDS = [
  'caralho', 'carai', 'caralhooo', 'caralhoo', 'caralha', 'caralhada',
  'porra', 'porrra', 'porraa', 'p0rra', 'p0rr4', 'porraaa', 'porrada',
  'merda', 'merdaa', 'm3rda', 'merdinha', 'merdinha', 'merdão', 'merdao',
  'puta', 'put4', 'putaa', 'putinha', 'putona', 'putaria', 'putarias',
  'puto', 'put0', 'putinha', 'putão', 'putao', 'putice', 'putisse',
  'foda', 'fodaa', 'f0da', 'fodase', 'foda-se', 'f0d4s3', 'foder',
  'fode', 'fodeu', 'fodendo', 'fudendo', 'fudê', 'fude', 'fudi', 'fuder',
  'fudido', 'fudida', 'fudendo', 'fuderia', 'fudase', 'fdp', 'f.d.p',
  'filhodaputa', 'filha da puta', 'filho da puta', 'filhodaput4',
  'filhadaputa', 'filhadaputa', 'filho-da-puta', 'filhadaput4',
  'desgraca', 'desgraça', 'desgracado', 'desgraçado', 'desgracada',
  'desgraçada', 'desgracento', 'desgracadao', 'desgracado', 'd3sgraça',
  'cacete', 'c4cete', 'caceta', 'cacetada', 'caceteiro', 'cacetinho',
  'buceta', 'bucet4', 'bucetinha', 'bucetao', 'bucetona', 'bucetinha',
  'boceta', 'bocetinha', 'xoxota', 'xota', 'xoxotinha',
  'cu', 'cú', 'cusao', 'cuzão', 'cuzinho', 'cuzao', 'cuzinho', 'cuzao',
  'cuzada', 'cuzudo', 'cuzuda', 'cuzao', 'cuzão', 'c.u', 'c u',
  'bundao', 'bundão', 'bundinha', 'bunda', 'bunduda', 'bundudo',
  'bosta', 'bost4', 'bostinha', 'bostao', 'bostão', 'bostinha',
  'merdinha', 'mrd', 'm3rd4', 'mrd4',
  'viado', 'vi4do', 'viada', 'viadinho', 'viadão', 'viadao', 'viadagem',
  'viadagem', 'boiola', 'boiolinha', 'bicha', 'bichinha', 'baitola',
  'piranha', 'piranh4', 'piraninha', 'piranhao', 'piranhaço', 'piranhaço',
  'vagabunda', 'vagabundo', 'vagabund4', 'vagabundagem', 'vagabundice',
  'arrombado', 'arrombada', 'arromb4do', 'arrombadao', 'arrombado',
  'arrombamento', 'arrombada', 'arrombadinho',
  'corno', 'corn0', 'cornudo', 'cornuda', 'corninho', 'corna',
  'otario', 'otária', 'otario', 'otaria', '0tario', 'otário', 'otariice',
  'idiota', 'idiot4', 'idiotice', 'idiotinha', 'imbecil', 'imbecíl',
  'imbecilidade', 'burro', 'burra', 'burrice', 'burrão', 'burrao',
  'babaca', 'babac4', 'babacão', 'babacao', 'babacaço', 'babacaço',
  'idiotao', 'idiotão', 'retardado', 'retardada', 'retard4do', 'retardado',
  'retardice', 'débil mental', 'debil mental',
  'nojento', 'nojenta', 'nojentice', 'escroto', 'escrota', 'escrotice',
  'canalha', 'canalhice', 'safado', 'safada', 'safadeza', 'safadice',
  'vagabundo', 'vagabunda', 'maldito', 'maldita', 'maldição', 'maldicao',
  'desgraçado', 'desgraçada', 'cretino', 'cretina', 'cretinice',
  'imbecil', 'otário', 'otária', 'palhaço', 'palhaco', 'palhaça', 'palhaca',
  'trouxa', 'troux4', 'trouxice', 'mané', 'mane', 'manézinho', 'maneq',
  'babaca', 'babacão', 'babacao', 'idiota', 'imbecil', 'estupido', 'estúpido',
  'estupida', 'estúpida', 'estupidez', 'animal', 'asno', 'asna',
  'jumento', 'jumenta', 'jegue', 'jegua', 'otario', 'otaria',
  'vai tomar no cu', 'vai tomar no cú', 'vtc', 'vtnc', 'vai se foder',
  'vai se fuder', 'vsf', 'vai tomar', 'tomar no cu', 'tomar no cú',
  'tomarnocu', 'tomarnocú', 'tnc', 'se fode', 'se fuder', 'se foder',
  'foda-se', 'fodase', 'f0dase', 'f0da-se', 'fdse', 'fds',
  'puta que pariu', 'pqp', 'p.q.p', 'pqpz', 'pqp', 'vai pra puta que pariu',
  'vpqp', 'filho de uma puta', 'filha de uma puta', 'fduma',
  'caralho velho', 'porra nenhuma', 'merda nenhuma', 'que merda',
  'que porra', 'que caralho', 'cacete velho', 'vai à merda', 'vai a merda',
  'vai pra merda', 'vai pro inferno', 'inferno', 'infernal',
  'diabo', 'diabos', 'diabinha', 'demonio', 'demônio', 'desgraça',
  'satanas', 'satanás', 'safado', 'safada', 'sacanagem', 'sacanagem',
  'sacana', 'sacaninha', 'sacaneia', 'sacanear', 'sacanagem',
  'putaria', 'putariazinha', 'fodelancia', 'fodelança', 'fodelencia',
  'pqp', 'vsf', 'vtnc', 'fdp', 'tnc', 'fml', 'krl', 'krlh', 'crlh',
  'prr', 'mrd', 'bct', 'bct4', 'pqpp', 'p0rr4', 'c4r4lh0', 'c4r4lho',
  'f0d4', 'f0d4r', 'f0d3r', 'fud3u', 'fud3ndo', 'put4', 'put0', 'buc3t4',
  'cuz4o', 'cuzao', 'vi4d0', 'p1r4nh4', 'v4g4bund0', '4rromb4d0',
  '0t4ri0', '1mb3c1l', 'b4b4c4', 'p4lh4c0', 'm4ld1t0', 'd3m0n10',
  'escrot0', 's4f4d0', 's4c4n4', 'c4c3t3', 'b0st4', 'm3rd4', 'cuzinho',
  'putinha', 'fudido', 'fudida', 'fodeu', 'fodendo', 'foder', 'fuder'
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
    const compactWord = compact(word);
    if (compactWord.length <= 2) {
      if (normalized === compactWord) return compactWord;
      continue;
    }
    if (normalized.includes(compactWord)) return compactWord;
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

function normalizeJid(jid) {
  return String(jid || '').split(':')[0].split('@')[0].replace(/\D/g, '');
}

async function isBotAdmin(sock, chat) {
  try {
    const metadata = await sock.groupMetadata(chat);
    const botNumber = normalizeJid(sock?.user?.id);
    const bot = metadata.participants.find((p) =>
      normalizeJid(p.id) === botNumber || normalizeJid(p.phoneNumber) === botNumber
    );
    return bot?.admin === 'admin' || bot?.admin === 'superadmin';
  } catch {
    return false;
  }
}

export async function moderateProfanity({ sock, chat, message }) {
  if (!chat?.endsWith('@g.us')) return { moderated: false };

  const found = findProfanity(getMessageText(message), chat);
  if (!found) return { moderated: false };

  // Modo de teste: todos entram na regra, inclusive administradores e dono.
  if (!(await isBotAdmin(sock, chat))) {
    return { moderated: false, reason: 'bot-not-admin', word: found };
  }

  try {
    await sock.sendMessage(chat, { delete: message.key });
  } catch {
    return { moderated: false, reason: 'delete-failed', word: found };
  }

  return { moderated: true, word: found, testMode: true };
}

export default {
  isAntiProfanityEnabled,
  setAntiProfanity,
  setCustomWords,
  getCustomWords,
  findProfanity,
  moderateProfanity
};
