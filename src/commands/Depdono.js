import config from '../config.js';
import { addTokens } from '../database/index.js';
import { claimOwnerFund, getOwnerFund } from '../services/group-tax.js';

function normalizeNumber(value) {
  return String(value || '')
    .split('@')[0]
    .replace(/\D/g, '');
}

function isOwner(...values) {
  const allowedNumbers = config.owner.numbers
    .map(normalizeNumber)
    .filter(Boolean);

  return values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map(normalizeNumber)
    .filter(Boolean)
    .some((number) => allowedNumbers.includes(number));
}

export default {
  name: 'depdono',
  aliases: ['dep-dono', 'fundodono'],
  category: 'admin',
  description: 'Consulta e saca o fundo do dono',
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

    if (!isOwner(candidates)) {
      return reply('❌ Apenas o dono do Togi pode usar este comando.');
    }

    const fund = getOwnerFund();

    if (args[0]?.toLowerCase() === 'sacar') {
      if (fund <= 0) return reply('🏦 O fundo do dono está vazio.');

      const amount = claimOwnerFund();
      addTokens(sender, amount);

      return reply(
        '💜 *DEP. DONO*\n\n' +
        '🪙 ' + amount.toLocaleString('pt-BR') +
        ' Tokens foram adicionados ao seu saldo.'
      );
    }

    return reply(
      '╭━━━〔 👑 DEP. DONO 〕━━━╮\n' +
      '┃ 🏦 Fundo acumulado\n' +
      '┃ 🪙 ' + fund.toLocaleString('pt-BR') + ' Tokens\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '💡 Use *.Depdono sacar* para transferir o fundo para seu saldo.'
    );
  }
};
