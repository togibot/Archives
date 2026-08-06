import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';
import config from '../../config.js';

const DAY = 24 * 60 * 60 * 1000;

export default {
  name: 'saque',
  aliases: ['daily', 'diario'],
  category: 'economia',
  description: 'Resgata o saque diário de Tokens',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    const now = Date.now();

    if (now - user.last_daily < DAY) {
      const remaining = DAY - (now - user.last_daily);
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.ceil((remaining % 3600000) / 60000);
      return reply(
        `⏳ *SAQUE DIÁRIO*\n\nVocê já fez seu saque de hoje!\n🕐 Próximo saque em aproximadamente *${hours}h ${minutes}min*.`
      );
    }

    const base = Number(config.economy.dailyAmount) || 100;
    const bonusChance = Math.random() < 0.30;
    const bonus = bonusChance
      ? Math.floor(Math.random() * (1000 - 120 + 1)) + 120
      : 0;
    const total = base + bonus;

    updateUser(sender, {
      tokens: user.tokens + total,
      last_daily: now
    });

    if (bonusChance) {
      return reply(
        `🏦 *SAQUE DIÁRIO*\n\n` +
        `🪙 Base: *+${base} Tokens*\n` +
        `🎁 BÔNUS: *+${bonus} Tokens*!\n\n` +
        `💰 Total recebido: *+${total} Tokens*\n` +
        `🔥 Você deu sorte hoje!`
      );
    }

    return reply(
      `🏦 *SAQUE DIÁRIO*\n\n` +
      `🪙 Você recebeu *+${total} Tokens*!\n` +
      `🎁 Hoje não saiu bônus. Boa sorte no próximo saque!`
    );
  }
};
