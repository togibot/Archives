import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

export default {
  name: 'afk',
  aliases: ['ausente'],
  category: 'geral',
  description: 'Ativa ou remove seu status AFK',
  async execute({ sender, message, args, reply }) {
    const user = ensureUser(sender, getName(message));
    if (user.afk_since) {
      const seconds = Math.floor((Date.now() - user.afk_since) / 1000);
      updateUser(sender, { afk_since: null, afk_reason: null });
      return reply(`👋 AFK desativado. Você ficou ausente por *${seconds}s*.`);
    }
    const reason = args.join(' ').slice(0, 120) || 'Sem motivo informado';
    updateUser(sender, { afk_since: Date.now(), afk_reason: reason });
    return reply(`💤 *AFK ATIVADO*\nMotivo: ${reason}`);
  }
};
