import { getPermissionLevel } from '../../core/permissions.js';
import { setAntiProfanity, isAntiProfanityEnabled } from '../../services/anti-palavrao.js';

export default {
  name: 'antipalavrao',
  aliases: [],
  category: 'admin',
  description: 'Liga ou desliga o anti-palavrão',
  async execute({ sock, chat, isGroup, sender, text, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) {
      return reply('❌ Apenas administradores podem configurar o anti-palavrão.');
    }

    if (text.trim()) {
      return reply('⚙️ Use apenas *.antipalavrao* — envie novamente para alternar entre ligado e desligado.');
    }

    const enabled = !isAntiProfanityEnabled(chat);
    setAntiProfanity(chat, enabled);

    return reply(
      `🛡️ Anti-palavrão: *${enabled ? 'ATIVADO ✅' : 'DESATIVADO ❌'}*\n` +
      (enabled
        ? '🧪 Modo de teste: mensagens detectadas serão apagadas.\n⚠️ Avisos e remoção automática estão pausados.'
        : '🔓 A proteção contra palavrões foi desativada neste grupo.')
    );
  }
};
