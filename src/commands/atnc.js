import config from '../config.js';
import { addTokens, ensureUser } from '../database/index.js';

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
  name: 'atnc',
  aliases: [],
  category: 'owner',
  description: 'Comando secreto do dono para adicionar Tokens',
  async execute({ sender, message, args, reply }) {
    const key = message?.key || {};

    // Baileys pode entregar o remetente como LID. Dependendo do tipo de
    // mensagem/versão, o número real pode aparecer em campos diferentes.
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

    if (!args[0] || !/^\+?\d+$/.test(String(args[0]).trim())) {
      return reply('❌ Uso secreto: .atnc <quantia>');
    }

    const amount = Number(String(args[0]).replace('+', ''));
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return reply('❌ A quantia precisa ser um número inteiro positivo válido.');
    }

    ensureUser(sender);
    const user = addTokens(sender, amount);

    await reply(`🔐 *ATNC EXECUTADO*\n\n🪙 +${amount} Tokens adicionados.\n💰 Saldo atual: ${user.tokens} Tokens`);
  }
};
