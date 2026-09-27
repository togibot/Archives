import { getPermissionLevel } from '../core/permissions.js';
import { configureGroupSchedule } from '../services/community-automation.js';

export default {
  name: 'sethorario',
  aliases: ['horario','sethours'],
  category: 'admin',
  description: 'Configura abertura e fechamento automáticos do grupo.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .sethorario em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar o horário.');
    }
    if (args.length < 2) {
      return reply('⏰ Use: .sethorario 22:00 07:00\n📌 Primeiro horário = abre\n📌 Segundo horário = fecha');
    }

    const result = await configureGroupSchedule(sock, chat, args[0], args[1]);
    if (!result.ok) {
      if (result.reason === 'invalid_time') return reply('❌ Horário inválido. Use o formato HH:MM, por exemplo 22:00.');
      if (result.reason === 'same_time') return reply('❌ O horário de abertura e fechamento não pode ser igual.');
      if (result.reason === 'bot_not_admin') return reply('❌ O Togi precisa ser administrador deste grupo para controlar abertura e fechamento.');
      return reply('❌ Não foi possível configurar o horário.');
    }

    return reply(
      '✅ *HORÁRIO AUTOMÁTICO CONFIGURADO!*\n\n' +
      '🟢 Abre: *' + result.schedule.openTime + '*\n' +
      '🔴 Fecha: *' + result.schedule.closeTime + '*\n\n' +
      '⏰ O Togi verificará o horário automaticamente.'
    );
  }
};
