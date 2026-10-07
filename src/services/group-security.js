import { getGroup, getSecurityStrike, incrementSecurityStrike, setGroupMute, updateGroup } from '../database/index.js';
import { findProfanity } from './anti-palavrao.js';
import { getPermissionLevel } from '../core/permissions.js';
import { getText } from '../utils/message.js';

function normalize(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[@4]/g, 'a').replace(/3/g, 'e').replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o').replace(/[5$]/g, 's').replace(/7/g, 't')
    .replace(/8/g, 'b').replace(/9/g, 'g')
    .replace(/(.)\1{2,}/g, '$1');
}

function compact(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, '');
}

function readWords(group) {
  try {
    const words = JSON.parse(group?.sds_words || '[]');
    return Array.isArray(words) ? words.map(compact).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function findSdsWord(text, group) {
  const normalized = compact(text);
  if (!normalized) return null;
  for (const word of readWords(group)) {
    if (word.length <= 2 ? normalized === word : normalized.includes(word)) return word;
  }
  return null;
}

function parseDuration(value) {
  const parts = String(value || '').trim().split(':').map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some(x => !Number.isFinite(x) || x < 0)) return null;
  const seconds = parts.length === 2
    ? parts[0] * 60 + parts[1]
    : parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (!Number.isInteger(seconds) || seconds <= 0 || seconds > 7 * 24 * 60 * 60) return null;
  return seconds;
}

function normalizeAction(value) {
  return String(value || '').toLowerCase() === 'mute' ? 'mute' : 'warn';
}

function botAdmin(sock, chat) {
  return sock.groupMetadata(chat).then(metadata => {
    const ids = [sock?.user?.id, sock?.user?.jid, sock?.user?.phoneNumber]
      .map(value => compact(value))
      .filter(Boolean);
    return (metadata?.participants || []).some(participant => {
      const pids = [participant?.id, participant?.jid, participant?.phoneNumber]
        .map(value => compact(value))
        .filter(Boolean);
      return pids.some(id => ids.includes(id)) && ['admin', 'superadmin'].includes(participant?.admin);
    });
  }).catch(() => false);
}

function settingsFor(group, kind) {
  const sds = kind === 'sds';
  return {
    action: normalizeAction(group?.[sds ? 'sds_action' : 'profanity_action']),
    warnAfter: Math.max(1, Number(group?.[sds ? 'sds_warn_after' : 'profanity_warn_after']) || 5),
    muteAfter: Math.max(1, Number(group?.[sds ? 'sds_mute_after' : 'profanity_mute_after']) || 3),
    muteSeconds: Math.max(1, Number(group?.[sds ? 'sds_mute_seconds' : 'profanity_mute_seconds']) || 600)
  };
}

export function getSdsWords(chat) {
  return readWords(getGroup(chat));
}

export function setSdsEnabled(chat, enabled) {
  updateGroup(chat, { sds_enabled: enabled ? 1 : 0 });
  return Boolean(enabled);
}

export function isSdsEnabled(chat) {
  return Boolean(Number(getGroup(chat)?.sds_enabled || 0));
}

export function setSdsWords(chat, words) {
  const cleaned = [...new Set((words || []).map(compact).filter(Boolean))].slice(0, 200);
  updateGroup(chat, { sds_words: JSON.stringify(cleaned) });
  return cleaned;
}

export function configureSecurity(chat, kind, patch) {
  const prefix = kind === 'sds' ? 'sds_' : 'profanity_';
  const allowed = ['action', 'warnAfter', 'muteAfter', 'muteSeconds'];
  const out = {};
  if (allowed.includes('action')) out[prefix + 'action'] = normalizeAction(patch.action);
  if (patch.warnAfter !== undefined) out[prefix + 'warn_after'] = Math.max(1, Math.min(100, Math.trunc(Number(patch.warnAfter) || 5)));
  if (patch.muteAfter !== undefined) out[prefix + 'mute_after'] = Math.max(1, Math.min(100, Math.trunc(Number(patch.muteAfter) || 3)));
  if (patch.muteSeconds !== undefined) out[prefix + 'mute_seconds'] = Math.max(1, Math.min(7 * 24 * 60 * 60, Math.trunc(Number(patch.muteSeconds) || 600)));
  updateGroup(chat, out);
  return settingsFor(getGroup(chat), kind);
}

export async function moderateGroupMessage({ sock, chat, message, sender }) {
  if (!chat?.endsWith('@g.us')) return { moderated: false };
  const group = getGroup(chat);
  if (!group) return { moderated: false };

  const permission = await getPermissionLevel({ sock, chat, jid: sender, message }).catch(() => 1);
  // Dono do Togi e ADMs do grupo nunca sofrem punição automática.
  if (permission >= 3) return { moderated: false };

  const text = getText(message);
  let kind = null;
  let found = null;

  if (isSdsEnabled(chat)) {
    found = findSdsWord(text, group);
    if (found) kind = 'sds';
  }

  if (!found) {
    found = findProfanity(text, chat);
    if (found) kind = 'profanity';
  }

  if (!found) return { moderated: false };

  if (!await botAdmin(sock, chat)) {
    return { moderated: false, reason: 'bot-not-admin', kind, word: found };
  }

  const key = {
    remoteJid: message?.key?.remoteJid || chat,
    id: message?.key?.id,
    fromMe: Boolean(message?.key?.fromMe),
    ...(message?.key?.participant ? { participant: message.key.participant } : {}),
    ...(message?.key?.participantAlt ? { participantAlt: message.key.participantAlt } : {})
  };

  if (!key.id) return { moderated: false, reason: 'missing-message-id', kind, word: found };

  try {
    await sock.sendMessage(chat, { delete: key });
  } catch (error) {
    return { moderated: false, reason: 'delete-failed', kind, word: found, error: error?.message || String(error) };
  }

  const settings = settingsFor(group, kind);
  const strike = incrementSecurityStrike(chat, sender, kind);
  const count = Number(strike?.count || 1);

  let muted = false;
  let warning = false;

  if (settings.action === 'mute') {
    setGroupMute(chat, sender, Date.now() + settings.muteSeconds * 1000);
    muted = true;
    warning = count % settings.muteAfter === 0;
  } else {
    warning = count % settings.warnAfter === 0;
  }

  const label = kind === 'sds' ? 'SDS' : 'ANTI-PALAVRÃO';
  let notice =
    '🚨 *' + label + '*\\n\\n' +
    '❌ Mensagem removida.\\n' +
    '📌 Motivo: ' + (kind === 'sds'
      ? 'uma palavra configurada pelo administrador foi detectada.'
      : 'um palavrão foi detectado.') +
    '\\n⚠️ Infrações detectadas: *' + count + '*';

  if (muted) notice += '\\n🔇 Você recebeu um mute automático por *' + Math.ceil(settings.muteSeconds / 60) + ' min*.';
  if (warning) notice += '\\n\\n⚠️ *AVISO:* o limite configurado pelo ADM foi atingido.';

  try {
    await sock.sendMessage(chat, {
      text: notice,
      mentions: [sender]
    });
  } catch {}

  return { moderated: true, kind, word: found, count, muted, warning };
}

export function parseSecurityDuration(value) {
  return parseDuration(value);
}
