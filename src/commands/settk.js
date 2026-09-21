import { ensureUser, getUser, updateUser } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';
import { resolveTargetJid } from '../utils/targets.js';

export default {
  name: 'settk',
  aliases: ['settoken', 'settokens'],
  category: 'owner',
  description: 'Define o saldo de Tokens de um usuário.',
  async execute({ sender, message, args, reply, sock, chat }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const numeric = args.filter(arg => /^\d+$/.test(String(arg)));
    const amount = Number(numeric.at(-1));
    if (!Number.isSafeInteger(amount) || amount < 0) return reply('❌ Use *.settk [@user] <quantia>*');
    const target = (await resolveTargetJid({ sock, chat, message })) || sender;
    ensureUser(target);
    updateUser(target, { tokens: amount });
    const user = getUser(target);
    return reply(`✅ *TOKENS DEFINIDOS*\n\n👤 ${user.name || 'Usuário'}\n🪙 Novo saldo: *${amount.toLocaleString('pt-BR')} Tokens*`);
  }
};
