import { getGroupSchedule } from '../database/index.js';

export default {
  name: 'verhorario',
  aliases: ['horariog','schedule'],
  category: 'admin',
  description: 'Mostra o horário automático do grupo.',
  async execute({ isGroup, chat, reply }) {
    if (!isGroup) return reply('❌ Use o .verhorario em um grupo.');
    const schedule = getGroupSchedule(chat);
    if (!schedule.enabled) return reply('⏰ Nenhum horário automático está configurado neste grupo.');
    return reply(
      '⏰ *HORÁRIO DO GRUPO*\n\n' +
      '🟢 Abre: *' + schedule.openTime + '*\n' +
      '🔴 Fecha: *' + schedule.closeTime + '*\n' +
      '📌 Status: 🟢 Ativo'
    );
  }
};
