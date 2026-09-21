import config from '../config.js';
import { resetUserAccount, ensureUser, getUser } from '../database/index.js';

function normalize(value) {
  return String(value || '').split('@')[0].replace(/\D/g, '');
}

function isOwner(sender) {
  const current = normalize(sender);
  return config.owner.numbers.map(normalize).filter(Boolean).includes(current);
}

function getTarget(message) {
  const ctx = message?.message?.extendedTextMessage?.contextInfo;
  return ctx?.mentionedJid?.[0] || ctx?.participant || null;
}

export default {
  name: 'resetuser',
  aliases: ['reset', 'resetar'],
  category: 'owner',
  description: 'Reseta a conta de um usuário.',
  async execute({ sender, message, args, reply }) {
    if (!isOwner(sender)) return;

    const target = getTarget(message) || (args[0]?.includes('@') ? args[0] : null);
    if (!target) return reply('❌ Marque o usuário.\n\n*.resetuser @user tokens*\n*.resetuser @user tudo*');

    const mode = String(args.find(arg => ['tokens', 'tudo'].includes(arg.toLowerCase())) || '').toLowerCase();
    if (!mode) return reply('❌ Escolha o tipo de reset:\n\n• *tokens* — zera apenas os Tokens\n• *tudo* — reseta a conta completa');

    ensureUser(target);
    const before = getUser(target);
    resetUserAccount(target, mode);
    const after = getUser(target);

    if (mode === 'tokens') {
      return reply(`✅ *TOKENS RESETADOS*\n\n👤 ${before.name || 'Usuário'}\n🪙 Saldo: *0 Tokens*`);
    }

    return reply(
      `✅ *CONTA RESETADA*\n\n👤 ${before.name || 'Usuário'}\n🪙 Tokens: *${after.tokens}*\n⭐ XP: *0*\n🏆 Nível: *1*\n🎴 Cards e inventário: zerados\n🐾 Pets: removidos\n🎮 Estatísticas: zeradas`
    );
  }
};
