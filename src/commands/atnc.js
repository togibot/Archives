import { addTokens, ensureUser } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';

export default {
  name: 'atnc',
  aliases: [],
  category: 'owner',
  description: 'Comando do dono para adicionar Tokens a si mesmo.',
  async execute({ sender, message, args, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const rawAmount = String(args[0] || '').trim();
    if (!/^\+?\d+$/.test(rawAmount)) return reply('❌ Uso: *.atnc <quantia>*');
    const amount = Number(rawAmount.replace('+', ''));
    if (!Number.isSafeInteger(amount) || amount <= 0) return reply('❌ A quantia precisa ser um número inteiro positivo.');
    ensureUser(sender);
    const user = addTokens(sender, amount);
    return reply(`🔐 *ATNC EXECUTADO*\n\n🪙 +${amount.toLocaleString('pt-BR')} Tokens\n💰 Saldo atual: *${Number(user.tokens || 0).toLocaleString('pt-BR')} Tokens*`);
  }
};
