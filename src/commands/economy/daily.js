import { ensureUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';
import { grantDailyReward } from '../../services/daily-message-reward.js';

const DAY = 24 * 60 * 60 * 1000;

function formatRemaining(ms) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export default {
  name: 'saque',
  aliases: ['daily', 'diario'],
  category: 'economia',
  description: 'Saque diário de Tokens com chance de bônus',
  async execute({ sender, message, reply }) {
    ensureUser(sender, getName(message));

    const reward = grantDailyReward(sender);
    if (!reward) {
      const user = ensureUser(sender, getName(message));
      const remaining = Math.max(0, DAY - (Date.now() - Number(user.last_daily || 0)));
      return reply(
        `⏳ *SAQUE DIÁRIO*\n\n` +
        `Você já fez seu saque de hoje.\n` +
        `🕐 Próximo saque em aproximadamente *${formatRemaining(remaining)}*.`
      );
    }

    const bonusLine = reward.bonus > 0
      ? `\n🎁 *BÔNUS:* +${reward.bonus} Tokens!`
      : '\n🍀 Hoje você ficou sem bônus extra.';

    return reply(
      `╭━━━〔 🏦 𝐒𝐀𝐐𝐔𝐄 𝐃𝐈Á𝐑𝐈𝐎 〕━━━╮\n` +
      `│ 🪙 Base: +${reward.base} Tokens` +
      `${bonusLine}\n` +
      `│ 💰 Total recebido: *+${reward.total} Tokens*\n` +
      `│ 💳 Saldo: ${reward.balance} Tokens\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    );
  }
};
