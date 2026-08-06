export default {
  name: 'dado',
  aliases: ['dice'],
  category: 'diversao',
  description: 'Rola um dado de 1 a 6',
  async execute({ reply }) {
    const result = Math.floor(Math.random() * 6) + 1;
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🎲 𝙳𝙰𝙳𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🎯 Resultado: *${result}* ${faces[result - 1]}\n\n✨ Boa sorte!`);
  }
};
