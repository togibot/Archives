import { getPermissionLevel } from '../core/permissions.js';
import { ensureGroup, updateGroup } from '../database/index.js';

function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || '').trim());
}

export default {
  name: 'horariogp',
  aliases: ['horariogrupo', 'fechamentogp'],
  category: 'admin',
  description: 'Configura o fechamento e abertura automáticos do grupo.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .horariogp em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar o horário do grupo.');
    }

    if (String(args?.[0] || '').toLowerCase() === 'off') {
      ensureGroup(chat);
      updateGroup(chat, { schedule_enabled: 0, schedule_last_action: '' });
      return reply('⏰ *Horário automático desativado.*');
    }

    const closeAt = args?.[0];
    const openAt = args?.[1];
    if (!validTime(closeAt) || !validTime(openAt)) {
      return reply('⏰ Use: *.horariogp 22:00 07:00*\n🌙 22:00 fecha\n☀️ 07:00 abre');
    }

    ensureGroup(chat);
    updateGroup(chat, {
      schedule_enabled: 1,
      close_time: closeAt,
      open_time: openAt,
      schedule_last_action: ''
    });

    return reply(
      '⏰ *HORÁRIO AUTOMÁTICO CONFIGURADO*\n\n' +
      '🌙 Fechar: *' + closeAt + '*\n' +
      '☀️ Abrir: *' + openAt + '*\n\n' +
      'O Togi fará a troca diariamente.'
    );
  }
};