import { getPermissionLevel } from '../core/permissions.js';

export default {
  name: 'abrir',
  aliases: ['abrirgrupo'],
  category: 'admin',
  description: 'Abre o grupo para mensagens de membros.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .abrir em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem abrir o grupo.');
    }
    try {
      await sock.groupSettingUpdate(chat, 'not_announcement');
      return reply('🔓 *GRUPO ABERTO*\\n\\nTodos os membros podem enviar mensagens novamente.');
    } catch (error) {
      return reply('❌ Não consegui abrir o grupo.\\n' + (error?.message || 'Erro desconhecido'));
    }
  }
};