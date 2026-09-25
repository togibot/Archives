import { getPermissionLevel } from '../../core/permissions.js';
import { getWarningConfig, setWarningTimeout } from '../../database/index.js';

function parseDuration(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (['off','0','desativado','sem'].includes(raw)) return 0;

  const match = raw.match(/^(\d+)\s*(m|min|minuto|minutos|h|hora|horas|d|dia|dias)$/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isSafeInteger(amount) || amount <= 0) return null;

  const unit = match[2];
  if (unit.startsWith('m')) return amount * 60 * 1000;
  if (unit.startsWith('h')) return amount * 60 * 60 * 1000;
  return amount * 24 * 60 * 60 * 1000;
}

function formatDuration(ms) {
  if (!ms) return 'sem expiração';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} dia(s)`;
}

export default {
  name: 'warntempo',
  aliases: ['warnduracao'],
  category: 'admin',
  description: 'Define por quanto tempo um aviso permanece.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .warntempo em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar o tempo dos avisos.');
    }

    if (!args[0]) {
      const cfg = getWarningConfig(chat);
      return reply(`⏳ *WARN TEMPO*\n\n⌛ Validade atual: *${formatDuration(cfg.timeoutMs)}*\n\nExemplos: *.warntempo 30m*, *.warntempo 2h*, *.warntempo 7d*\nUse *.warntempo off* para desativar a expiração.`);
    }

    const ms = parseDuration(args[0]);
    if (ms === null) return reply('❌ Use um tempo como *30m*, *2h*, *7d* ou *off*.');

    setWarningTimeout(chat, ms);
    return reply(ms === 0
      ? '✅ Expiração automática dos avisos foi desativada.'
      : `✅ Avisos agora expiram após *${formatDuration(ms)}* sem novos avisos.`);
  }
};
