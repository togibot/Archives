import { getPermissionLevel, isOwner } from '../core/permissions.js';
import { setGroupMute } from '../database/index.js';
import { resolveTargetJid } from '../utils/targets.js';

function parseDuration(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const parts = raw.split(':').map(Number);
  if (parts.some(part => !Number.isFinite(part) || part < 0)) return null;
  let seconds = 0;
  if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  else if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else return null;
  if (!Number.isInteger(seconds) || seconds <= 0 || seconds > 7 * 24 * 60 * 60) return null;
  return seconds * 1000;
}

function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [];
  if (hours) parts.push(hours + 'h');
  if (minutes || hours) parts.push(minutes + 'min');
  if (seconds || (!hours && !minutes)) parts.push(seconds + 's');
  return parts.join(' ');
}

export default {
  name: 'castigo',
  aliases: ['punir'],
  category: 'admin',
  description: 'Aplica mute temporário a um membro.',
  async execute({ sock, chat, sender, message, isGroup, reply, args }) {
    if (!isGroup) return reply('❌ Use o .castigo em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem aplicar castigo.');
    }

    const duration = parseDuration(args?.[0]);
    if (!duration) return reply('❌ Use *.castigo <tempo>*\nExemplo: *.castigo 10:00* (10 minutos).');

    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o membro ou responda à mensagem dele.');

    const targetLevel = await getPermissionLevel({ sock, chat, jid: target, message });
    if (targetLevel >= 3 || isOwner(target)) {
      return reply('🛡️ Não posso aplicar castigo em um administrador ou dono do Togi.');
    }

    setGroupMute(chat, target, Date.now() + duration);

    return reply(
      '🔇 *『 𝙲𝙰𝚂𝚃𝙸𝙶𝙾 』*\n\n' +
      '👤 @' + target.split('@')[0] + '\n' +
      '⏱️ Duração: *' + formatDuration(duration) + '*\n\n' +
      '⚠️ As mensagens enviadas durante o castigo serão apagadas automaticamente.',
      { mentions: [target] }
    );
  }
};