import config from '../config.js';
import { ensureUser, getUser } from '../database/index.js';

function getTarget(message, sender) {
  const ctx = message?.message?.extendedTextMessage?.contextInfo;
  return ctx?.mentionedJid?.[0] || (ctx?.participant ? ctx.participant : null) || sender;
}

export default {
  name: 'csaldo',
  aliases: ['consultarsaldo', 'ver saldo'],
  category: 'owner',
  description: 'Consulta o saldo de Tokens de um usuário.',
  async execute({ sender, message, args, reply }) {
    const target = getTarget(message, args[0]?.includes('@') ? args[0] : sender);
    ensureUser(target);
    const user = getUser(target);
    const isSelf = String(target) === String(sender);

    return reply(
      '╭━━━〔 💰 𝐂𝐎𝐍𝐒𝐔𝐋𝐓𝐀 𝐃𝐄 𝐒𝐀𝐋𝐃𝐎 〕━━━╮\n' +
      `┃ 👤 Usuário: ${user.name || 'Usuário'}\n` +
      `┃ 🪙 Saldo: ${Number(user.tokens || 0).toLocaleString('pt-BR')} ${config.economy.name}(s)\n` +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯' +
      (isSelf ? '' : '\n\n🔒 Consulta realizada pelo painel do dono.')
    );
  }
};
