import { getPermissionLevel } from '../core/permissions.js';
import { configureGoodbye, getCommunityId } from '../services/community-manager.js';

export default {
  name: 'setbd',
  aliases: ['setdespedida','setgoodbye'],
  category: 'admin',
  description: 'Define o grupo de despedida da comunidade.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .setBD dentro de um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) return reply('❌ Apenas administradores podem configurar o .setBD.');
    const metadata = await sock.groupMetadata(chat);
    if (!metadata?.announce) return reply('❌ Este comando deve ser configurado no grupo de anúncios, onde apenas administradores podem falar.');
    const communityJid = getCommunityId(metadata, chat);
    const custom = args.join(' ').trim();
    const settings = configureGoodbye(communityJid, chat, custom || null);
    return reply(
      '✅ *DESPEDIDA CONFIGURADA!*\n\n' +
      '👋 Grupo de destino: *' + (metadata.subject || chat) + '*\n' +
      '🌐 Comunidade: ' + communityJid + '\n' +
      '📝 Mensagem: ' + (custom || settings.goodbye_message) + '\n\n' +
      'ℹ️ A automação de saída da comunidade será ligada na próxima etapa.'
    );
  }
};
