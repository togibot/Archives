import { getPermissionLevel } from '../core/permissions.js';
import { configureWelcome, getCommunityId } from '../services/community-manager.js';

export default {
  name: 'setbv',
  aliases: ['setbemvindo','setwelcome'],
  category: 'admin',
  description: 'Define o grupo de boas-vindas da comunidade.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .setBV dentro de um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) return reply('❌ Apenas administradores podem configurar o .setBV.');
    const metadata = await sock.groupMetadata(chat);
    const communityJid = getCommunityId(metadata, chat);
    const custom = args.join(' ').trim();
    const settings = configureWelcome(communityJid, chat, custom || null);
    return reply(
      '✅ *BOAS-VINDAS CONFIGURADAS!*\n\n' +
      '👋 Grupo de destino: *' + (metadata.subject || chat) + '*\n' +
      '🌐 Comunidade: ' + communityJid + '\n' +
      '📝 Mensagem: ' + (custom || settings.welcome_message) + '\n\n' +
      'ℹ️ A automação de entrada da comunidade será ligada na próxima etapa.'
    );
  }
};
