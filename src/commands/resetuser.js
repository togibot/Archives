import { resetUserAccount, ensureUser, getUser } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';
import { resolveTargetJid } from '../utils/targets.js';

export default {
  name: 'resetuser',
  aliases: ['reset', 'resetar'],
  category: 'owner',
  description: 'Reseta a conta de um usuário.',
  async execute({ sender, message, args, reply, sock, chat }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o usuário ou responda à mensagem dele.\n\n*.resetuser @user tokens*\n*.resetuser @user tudo*');
    const mode = String(args.find(arg => ['tokens','tudo'].includes(arg.toLowerCase())) || '').toLowerCase();
    if (!mode) return reply('❌ Escolha: *tokens* ou *tudo*.');
    ensureUser(target);
    const before = getUser(target);
    resetUserAccount(target, mode);
    const after = getUser(target);
    if (mode === 'tokens') return reply(`✅ *TOKENS RESETADOS*\n\n👤 ${before.name || 'Usuário'}\n🪙 Saldo: *0 Tokens*`);
    return reply(`✅ *CONTA RESETADA*\n\n👤 ${before.name || 'Usuário'}\n🪙 Tokens: *${after.tokens}*\n⭐ XP: *0*\n🏆 Nível: *1*\n🎴 Cards e inventário: zerados\n🐾 Pets: removidos\n🎮 Estatísticas: zeradas`);
  }
};
