import config from '../config.js';
import { ensureUser, getUser } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';
import { resolveTargetJid } from '../utils/targets.js';

export default {
  name: 'csaldo',
  aliases: ['consultarsaldo', 'ver saldo'],
  category: 'owner',
  description: 'Consulta o saldo de Tokens de um usuário.',
  async execute({ sender, message, reply, sock, chat }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const target = (await resolveTargetJid({ sock, chat, message })) || sender;
    ensureUser(target);
    const user = getUser(target);
    return reply('╭━━━〔 💰 𝐂𝐎𝐍𝐒𝐔𝐋𝐓𝐀 𝐃𝐄 𝐒𝐀𝐋𝐃𝐎 〕━━━╮\n' +
      `┃ 👤 Usuário: ${user.name || target.split('@')[0]}\n` +
      `┃ 🪙 Saldo: ${Number(user.tokens || 0).toLocaleString('pt-BR')} ${config.economy.name}(s)\n` +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
  }
};
