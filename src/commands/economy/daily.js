import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';
import config from '../../config.js';

const DAY = 24 * 60 * 60 * 1000;

export default {
  name: 'daily',
  aliases: ['diario'],
  category: 'economia',
  description: 'Resgata Tokens diariamente',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    const now = Date.now();
    if (now - user.last_daily < DAY) {
      const remaining = DAY - (now - user.last_daily);
      const hours = Math.ceil(remaining / 3600000);
      return reply(`⏳ Você já resgatou seu diário. Tente novamente em aproximadamente *${hours}h*.`);
    }
    updateUser(sender, {
      tokens: user.tokens + config.economy.dailyAmount,
      last_daily: now
    });
    return reply(`🎁 *RECOMPENSA DIÁRIA*\n\nVocê recebeu ${config.economy.currency} *${config.economy.dailyAmount} ${config.economy.name}*!`);
  }
};
