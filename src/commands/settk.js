import config from '../config.js';
import { ensureUser, getUser, updateUser } from '../database/index.js';

function normalize(value) {
  return String(value || '').split('@')[0].replace(/\D/g, '');
}

function isOwner(sender) {
  const current = normalize(sender);
  return config.owner.numbers.map(normalize).filter(Boolean).includes(current);
}

function getTarget(message, sender, arg) {
  const ctx = message?.message?.extendedTextMessage?.contextInfo;
  return ctx?.mentionedJid?.[0] || (ctx?.participant ? ctx.participant : null) || (arg?.includes('@') ? arg : sender);
}

export default {
  name: 'settk',
  aliases: ['settoken', 'settokens'],
  category: 'owner',
  description: 'Define o saldo de Tokens de um usuário.',
  async execute({ sender, message, args, reply }) {
    if (!isOwner(sender)) return;

    const numeric = args.filter(arg => /^\d+$/.test(String(arg)));
    const amount = Number(numeric.at(-1));
    if (!Number.isSafeInteger(amount) || amount < 0) {
      return reply('❌ Use *.settk [@user] <quantia>*');
    }

    const target = getTarget(message, sender, args.find(arg => arg.includes('@')));
    ensureUser(target);
    updateUser(target, { tokens: amount });
    const user = getUser(target);

    await reply(
      `✅ *TOKENS DEFINIDOS*\n\n👤 ${user.name || 'Usuário'}\n🪙 Novo saldo: *${amount.toLocaleString('pt-BR')} Tokens*`
    );
  }
};
