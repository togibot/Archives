import config from '../config.js';
import { addTokens, ensureUser } from '../database/index.js';

function normalizeJid(value) {
  return String(value || '').trim().replace(/:\d+(?=@)/, '');
}

function isOwner(jid) {
  const normalizedJid = normalizeJid(jid);
  const number = normalizedJid.split('@')[0].replace(/\D/g, '');
  return config.owner.numbers.some((allowed) => {
    const allowedNumber = String(allowed).replace(/\D/g, '');
    return allowedNumber && allowedNumber === number;
  });
}

export default {
  name: 'atnc',
  aliases: [],
  category: 'owner',
  description: 'Comando secreto do dono para adicionar Tokens',
  async execute({ sender, args, reply }) {
    if (!isOwner(sender)) return;

    if (!args[0] || !/^[+]?\d+$/.test(String(args[0]).trim())) {
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
