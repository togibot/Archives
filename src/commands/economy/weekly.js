import { getUser, updateUser, addTokens } from '../../database/index.js';

export default { name: 'weekly', aliases: ['semanal'], category: 'economia', description: 'Recompensa semanal de Tokens', async execute({ sender, reply }) {
  const user = getUser(sender); const now = Date.now(); const week = 7 * 24 * 60 * 60 * 1000;
  if (now - user.last_weekly < week) return reply(`⏳ Você já recebeu seu semanal.\n🪙 Próximo: ${Math.ceil((week - (now-user.last_weekly))/3600000)}h.`);
  updateUser(sender, { last_weekly: now }); addTokens(sender, 1200);
  return reply('╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🎁 𝚆𝙴𝙴𝙺𝙻𝚈 𝚁𝙴𝙲𝙴𝙱𝙸𝙳𝙾\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n🪙 +1.200 Tokens!');
} };
