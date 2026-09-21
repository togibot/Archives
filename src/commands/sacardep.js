import config from '../config.js';
import { addTokens } from '../database/index.js';
import { getOwnerFund, withdrawOwnerFund } from '../services/group-tax.js';

function normalize(value) {
  return String(value || '').split('@')[0].replace(/\D/g, '');
}

function isOwner(...values) {
  const allowed = config.owner.numbers.map(normalize).filter(Boolean);
  return values
    .flatMap(value => Array.isArray(value) ? value : [value])
    .map(normalize)
    .filter(Boolean)
    .some(number => allowed.includes(number));
}

export default {
  name: 'sacardep',
  aliases: ['sacardepdono', 'sacarfundodono'],
  category: 'owner',
  description: 'Saca uma quantidade específica do fundo do dono.',
  async execute({ sender, message, args, reply }) {
    const key = message?.key || {};
    const candidates = [
      sender,
      key.participant,
      key.participantAlt,
      key.participantPn,
      key.senderPn,
      key.remoteJid,
      key.remoteJidAlt,
      message?.participant,
      message?.participantAlt,
      message?.senderPn,
      message?.sender?.id,
      message?.sender?.phoneNumber
    ];

    if (!isOwner(candidates)) return;

    const amount = Number(args[0]);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return reply('❌ Use *.sacardep <quantia>*');
    }

    const fund = getOwnerFund();
    if (amount > fund) {
      return reply(
        `❌ O fundo do dono não possui Tokens suficientes.\n\n🏦 Disponível: *${fund.toLocaleString('pt-BR')}*\n🪙 Solicitado: *${amount.toLocaleString('pt-BR')}*`
      );
    }

    const withdrawn = withdrawOwnerFund(amount);
    if (withdrawn !== amount) {
      return reply('❌ Não foi possível realizar o saque. Tente novamente.');
    }

    addTokens(sender, withdrawn);

    return reply(
      `✅ *SAQUE DO FUNDO REALIZADO*\n\n🪙 +${withdrawn.toLocaleString('pt-BR')} Tokens\n🏦 Fundo restante: *${getOwnerFund().toLocaleString('pt-BR')} Tokens*`
    );
  }
};
