import { ensureUser, getUser, updateUser } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';
import { resolveTargetJid } from '../utils/targets.js';

export default {
  name: 'rtnc',
  aliases: ['remtk', 'removetoken', 'removetokens'],
  category: 'owner',
  description: 'Remove Tokens de outro usuário.',
  async execute({ sender, message, args, reply, sock, chat }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o usuário ou responda à mensagem dele.');
    const amount = Number(args.find(arg => /^\d+$/.test(String(arg))));
    if (!Number.isSafeInteger(amount) || amount <= 0) return reply('❌ Use *.rtnc @user <quantia>*');
    ensureUser(target);
    const user = getUser(target);
    const current = Number(user.tokens || 0);
    const removed = Math.min(current, amount);
    updateUser(target, { tokens: current - removed });
    const after = getUser(target);
    return reply(
      '✅ *TOKENS REMOVIDOS*\n\n' +
      '👤 ' + (after.name || target.split('@')[0]) + '\n' +
      '🪙 -' + removed.toLocaleString('pt-BR') + ' Tokens\n' +
      '💰 Saldo atual: *' + Number(after.tokens || 0).toLocaleString('pt-BR') + ' Tokens*' +
      (removed < amount ? '\n\nℹ️ O usuário possuía apenas ' + current.toLocaleString('pt-BR') + ' Tokens.' : '')
    );
  }
};