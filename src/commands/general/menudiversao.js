export default {
  name: 'menudiversao',
  aliases: ['diversaomenu'],
  category: 'geral',
  description: 'Menu de diversão',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🎲 𝙳𝙸𝚅𝙴𝚁𝚂Ã𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🧠 *QUIZ*\n├ .quiz\n├ .quizrank\n├ .quizstats\n└ .quizstreak\n\n🎯 *JOGOS RÁPIDOS*\n├ .8ball pergunta\n├ .dado\n└ .coin\n\n💞 *SOCIAL*\n├ .ship @pessoa\n└ .casal\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎉 Escolha um comando e bora brincar!`);
  }
};
