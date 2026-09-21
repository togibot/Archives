import { addTokens, ensureUser, getUser } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';
import { resolveTargetJid } from '../utils/targets.js';

export default {
  name: 'adtk',
  aliases: ['addtk', 'addtoken', 'addtokens'],
  category: 'owner',
  description: 'Adiciona Tokens a outro usuário.',
  async execute({ sender, message, args, reply, sock, chat }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o usuário ou responda à mensagem dele.');
    const amount = Number(args.find(arg => /^\d+$/.test(String(arg))));
    if (!Number.isSafeInteger(amount) || amount <= 0) return reply('❌ Use *.adtk @user <quantia>*');
    ensureUser(target);
    const user = addTokens(target, amount);
    const owner = getUser(sender);
    return reply(
      '✅ *TOKENS ADICIONADOS*\n\n' +
      '👤 ' + (user.name || target.split('@')[0]) + '\n' +
      '🪙 +' + amount.toLocaleString('pt-BR') + ' Tokens\n' +
      '💰 Saldo atual: *' + Number(user.tokens || 0).toLocaleString('pt-BR') + ' Tokens*\n\n' +
      '🔐 Operado por: ' + (owner?.name || sender.split('@')[0])
    );
  }
};