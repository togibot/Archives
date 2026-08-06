import { ensureUser, updateUser } from '../../database/index.js';
import config from '../../config.js';

export default {
  name: 'pay',
  aliases: ['pagar', 'transferir'],
  category: 'economia',
  description: 'Transfere Tokens para outro usuário',
  async execute({ sender, message, args, reply }) {
    const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const amount = Number(args.find(arg => /^\d+$/.test(arg)));
    if (!target) return reply(`❌ Marque quem receberá os ${config.economy.name}.`);
    if (!Number.isInteger(amount) || amount <= 0) return reply('❌ Informe uma quantidade inteira positiva.');
    if (target === sender) return reply('❌ Você não pode transferir Tokens para si mesmo.');

    const from = ensureUser(sender);
    const to = ensureUser(target);
    if (from.tokens < amount) return reply(`❌ Saldo insuficiente. Você possui ${from.tokens} Tokens.`);

    updateUser(sender, { tokens: from.tokens - amount });
    updateUser(target, { tokens: to.tokens + amount });
    return reply(`💸 *TRANSFERÊNCIA REALIZADA*\n\n${config.economy.currency} *${amount} ${config.economy.name}* enviados com sucesso!`);
  }
};
