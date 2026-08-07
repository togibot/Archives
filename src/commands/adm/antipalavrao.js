import { getPermissionLevel } from '../../core/permissions.js';
import { setAntiProfanity, isAntiProfanityEnabled } from '../../services/anti-palavrao.js';

export default {
  name: 'antipalavrao',
  aliases: ['antipalavrao'],
  category: 'admin',
  description: 'Ativa ou desativa o banimento automático por palavrões',
  async execute({ sock, chat, isGroup, sender, text, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem configurar o anti-palavrão.');

    const value = text.trim().toLowerCase();
    if (!['on', 'off', 'ativar', 'desativar'].includes(value)) {
      return reply(`🛡️ Anti-palavrão está *${isAntiProfanityEnabled(chat) ? 'ATIVADO ✅' : 'DESATIVADO ❌'}*\n\nUse *.antipalavrao on* ou *.antipalavrao off*.`);
    }

    const enabled = value === 'on' || value === 'ativar';
    setAntiProfanity(chat, enabled);
    return reply(`🛡️ Anti-palavrão: *${enabled ? 'ATIVADO ✅' : 'DESATIVADO ❌'}*\n${enabled ? '🚫 Palavrões e várias variações serão detectados e o autor será removido.' : '🔓 A moderação automática foi desativada neste grupo.'}`);
  }
};
