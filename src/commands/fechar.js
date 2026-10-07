import { getPermissionLevel } from '../core/permissions.js';

export default {
  name: 'fechar',
  aliases: ['fechargrupo'],
  category: 'admin',
  description: 'Fecha o grupo para mensagens de membros.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .fechar em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem fechar o grupo.');
    }
    try {
      await sock.groupSettingUpdate(chat, 'announcement');
      return reply('🔒 *GRUPO FECHADO*\\n\\nSomente administradores podem enviar mensagens agora.');
    } catch (error) {
      return reply('❌ Não consegui fechar o grupo.\\n' + (error?.message || 'Erro desconhecido'));
    }
  }
};