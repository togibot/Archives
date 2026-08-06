export default {
  name: 'menupets',
  aliases: ['petsmenu'],
  category: 'geral',
  description: 'Menu de pets',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🐾 𝙿𝙴𝚃𝚂 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐶 *MEUS PETS*\n• .pets\n• .petshop\n• .comprarpet\n\n❤️ *CUIDADOS*\n• .alimentar\n\n🎁 *SOCIAL*\n• .doarpet\n• .doarcomida\n\n⭐ Novos cuidados, raridades e níveis de pet em breve!`);
  }
};
