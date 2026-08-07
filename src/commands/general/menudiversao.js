export default {
  name: 'menudiversao',
  aliases: ['diversaomenu'],
  category: 'geral',
  description: 'Menu de diversão',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🎲 𝙳𝙸𝚅𝙴𝚁𝚂Ã𝙾 • 𝚃𝙾𝙶𝙸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🧠 *QUIZ*
├ .quiz
├ .quizrank
├ .quizstats
└ .quizstreak

🎮 *TOGI GAMES*
├ .jogos
├ .forca
├ .anagrama
├ .adivinhe
└ .gamestats

🎯 *JOGOS RÁPIDOS*
├ .8ball pergunta
├ .dado
└ .coin

🎴 *TOGI CARDS*
├ .album
├ .carta <nome>
├ .pack
├ .vendercarta <nome>
└ .doarcarta <nome> @pessoa

🏠 *TOGI HOUSE*
├ .casa
├ .casa criar <nome>
├ .casa doar <tokens>
└ .casa top

💞 *SOCIAL*
├ .ship @pessoa
├ .casal
├ .beijar @pessoa
├ .abracar @pessoa
├ .carinho @pessoa
├ .segurarmao @pessoa
└ .encontro @pessoa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Escolha um comando e bora brincar!`);
  }
};
