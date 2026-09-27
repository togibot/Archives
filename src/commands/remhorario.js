import { getPermissionLevel } from '../core/permissions.js';
import { removeGroupSchedule } from '../services/community-automation.js';

export default {
  name: 'remhorario',
  aliases: ['delhorario','rmhorario'],
  category: 'admin',
  description: 'Remove o horário automático do grupo.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .remhorario em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem remover o horário.');
    }
    removeGroupSchedule(chat);
    return reply('✅ Horário automático removido. O Togi não fará mais alterações automáticas de abertura/fechamento neste grupo.');
  }
};
