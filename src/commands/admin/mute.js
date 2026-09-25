import { getPermissionLevel } from '../../core/permissions.js';
import { setGroupMute } from '../../database/index.js';
import { resolveTargetJid } from '../../utils/targets.js';

export default {
  name: 'mute',
  aliases: ['silenciar'],
  category: 'admin',
  description: 'Impede um membro de enviar mensagens no grupo.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .mute em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem mutar membros.');
    }

    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o membro ou responda à mensagem dele.');

    setGroupMute(chat, target);
    return reply(`🔇 @${target.split('@')[0]} foi mutado neste grupo. As mensagens dele serão apagadas automaticamente.`, { mentions: [target] });
  }
};
