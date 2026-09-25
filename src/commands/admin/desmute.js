import { getPermissionLevel } from '../../core/permissions.js';
import { removeGroupMute, isGroupMuted } from '../../database/index.js';
import { resolveTargetJid } from '../../utils/targets.js';

export default {
  name: 'desmute',
  aliases: ['unmute','dessilenciar'],
  category: 'admin',
  description: 'Remove o mute de um membro.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .desmute em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem desmutar membros.');
    }

    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o membro ou responda à mensagem dele.');

    const removed = removeGroupMute(chat, target);
    if (!removed && !isGroupMuted(chat, target)) {
      return reply(`🔊 @${target.split('@')[0]} não estava mutado.`, { mentions: [target] });
    }

    return reply(`🔊 @${target.split('@')[0]} foi desmutado neste grupo.`, { mentions: [target] });
  }
};
