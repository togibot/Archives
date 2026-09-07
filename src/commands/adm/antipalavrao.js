import { getPermissionLevel } from '../../core/permissions.js';
import { setAntiProfanity, isAntiProfanityEnabled } from '../../services/anti-palavrao.js';

export default {
  name: 'antipalavrao',
  aliases: ['antipalavrao'],
  category: 'admin',
  description: 'Ativa ou desativa a proteção contra palavrões',
  async execute({ sock, chat, isGroup, sender, text, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem configurar o anti-palavrão.');

    const value = text.trim().toLowerCase();
    if (!['on', 'off', 'ativar', 'desativar'].includes(value)) {
      return reply(`🛡️ Anti-palavrão está *${isAntiProfanityEnabled(chat) ? 'ATIVADO ✅' : 'DESATIVADO ❌'}*\n\nUse *.antipalavrao on* ou *.antipalavrao off*.`);
    }

    const enabled = value === 'on' || value === 'ativar';
    setAntiProfanity(chat, enabled);
    return reply(`🛡️ Anti-palavrão: *${enabled ? 'ATIVADO ✅' : 'DESATIVADO ❌'}*\n${enabled ? '🚫 Palavrões e variações serão detectados, a mensagem será apagada e o autor receberá um aviso.' : '🔓 A moderação automática foi desativada neste grupo.'}`);
  }
};
