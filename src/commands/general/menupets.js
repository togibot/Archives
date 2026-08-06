import config from '../../config.js';

export default {
  name: 'menupets',
  aliases: ['petsmenu'],
  category: 'geral',
  description: 'Menu de pets',
  async execute({ reply }) {
    const p = config.bot.prefix;
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🐾 𝙿𝙴𝚃𝚂 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐾 *MEUS PETS*\n• ${p}meupet\n• ${p}meuspets\n• ${p}petinfo <id>\n• ${p}petshop\n• ${p}comprarpet <id>\n• ${p}upgradepetshop\n\n❤️ *CUIDADOS*\n• ${p}alimentar <id>\n• ${p}daragua <id>\n• ${p}brincar <id>\n• ${p}passear <id> — 4x por dia\n• ${p}treinar <id>\n• ${p}dormir <id>\n• ${p}curar <id>\n\n🎁 *SOCIAL*\n• ${p}doarpet <id> @pessoa\n• ${p}doarcomida\n\n⚠️ *ATENÇÃO*\n🍖 Fome e 💧 sede diminuem com o tempo.\n🪦 Se o pet for negligenciado, a saúde cai até ele morrer.\n\n🏆 *RANKING*\n• ${p}petstats`);
  }
};
