import { addTokens } from '../database/index.js';
import { getOwnerFund, withdrawOwnerFund } from '../services/group-tax.js';
import { isOwnerMessage } from '../core/permissions.js';

export default {
  name: 'sacardep',
  aliases: ['sacardepdono','sacarfundodono'],
  category: 'owner',
  description: 'Saca uma quantidade específica do fundo do dono.',
  async execute({ sender, message, args, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const amount = Number(args[0]);
    if (!Number.isSafeInteger(amount) || amount <= 0) return reply('❌ Use *.sacardep <quantia>*');
    const fund = getOwnerFund();
    if (amount > fund) return reply(`❌ Fundo insuficiente.\n\n🏦 Disponível: *${fund.toLocaleString('pt-BR')}*\n🪙 Solicitado: *${amount.toLocaleString('pt-BR')}*`);
    const withdrawn = withdrawOwnerFund(amount);
    if (withdrawn !== amount) return reply('❌ Não foi possível realizar o saque. Tente novamente.');
    addTokens(sender, withdrawn);
    return reply(`✅ *SAQUE DO FUNDO REALIZADO*\n\n🪙 +${withdrawn.toLocaleString('pt-BR')} Tokens\n🏦 Fundo restante: *${getOwnerFund().toLocaleString('pt-BR')} Tokens*`);
  }
};
