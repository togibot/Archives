export default {
  name: 'menueconomia',
  aliases: ['economia'],
  category: 'geral',
  description: 'Menu de economia',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🪙 𝙴𝙲𝙾𝙽𝙾𝙼𝙸𝙰 • 𝚃𝙾𝙺𝙴𝙽\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💰 *CARTEIRA*\n• .saldo\n• .daily\n• .pay\n\n🏪 *LOJA*\n• .loja\n• .comprar\n• .inventario\n\n🥷 *RISCO*\n• .roubar\n• .escudo 🔜\n\n✨ Mais sistemas de economia em breve!`);
  }
};
