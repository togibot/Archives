import { ensureUser, getGameStats } from '../database/index.js';

export default {
  name: 'gamestats',
  aliases: ['estatisticasjogos', 'jogostats'],
  category: 'fun',
  description: 'Mostra suas estatísticas nos minijogos.',
  async execute({ sender, reply }) {
    ensureUser(sender);
    const stats = getGameStats(sender) || { played: 0, wins: 0, best_score: 0 };
    const rate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
    return reply(`╭━━━〔 🎮 𝐒𝐔𝐀𝐒 𝐄𝐒𝐓𝐀𝐓Í𝐒𝐓𝐈𝐂𝐀𝐒 〕━━━╮\n┃ 🎯 Partidas: *${stats.played}*\n┃ 🏆 Vitórias: *${stats.wins}*\n┃ 📈 Taxa: *${rate}%*\n┃ ⭐ Melhor pontuação: *${stats.best_score}*\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
