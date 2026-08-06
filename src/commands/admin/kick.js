import { getPermissionLevel } from '../../core/permissions.js';

export default {
  name: 'kick',
  aliases: ['banir'],
  category: 'admin',
  description: 'Remove um membro do grupo',
  async execute({ sock, chat, isGroup, message, reply, sender }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Você não tem permissão para isso.');
    const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return reply('❌ Marque o membro que será removido.');
    await sock.groupParticipantsUpdate(chat, [target], 'remove');
    return reply('✅ Membro removido do grupo.');
  }
};
