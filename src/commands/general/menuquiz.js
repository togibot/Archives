export default {
  name: 'menuquiz',
  aliases: ['quizmenu'],
  category: 'geral',
  description: 'Menu de quiz',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🧠 𝚀𝚄𝙸𝚉 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🎯 *JOGAR*\n• .quiz\n\n🏆 *EM BREVE*\n• .quizrank\n• .quizstats\n• .quizstreak\n\n🔥 Prepare-se para competir por Tokens!`);
  }
};
