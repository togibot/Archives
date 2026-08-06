export default {
  name: 'coin',
  aliases: ['moeda', 'caraoucoroa'],
  category: 'diversao',
  description: 'Joga uma moeda para decidir entre cara e coroa',
  async execute({ reply }) {
    const result = Math.random() < 0.5 ? 'CARA 🪙' : 'COROA 🪙';
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🪙 𝙼𝙾𝙴𝙳𝙰 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🎯 Caiu: *${result}*\n\n🍀 Tente a sorte novamente!`);
  }
};
