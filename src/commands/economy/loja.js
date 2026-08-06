import { shopItems } from '../../data/catalog.js';

export default {
  name: 'loja',
  aliases: ['shop'],
  async execute({ reply }) {
    const lines = Object.entries(shopItems).map(([id, item]) => `${id} — ${item.name} | 🪙 ${item.price}\n   ${item.description}`);
    await reply(`╭━━━━━━━━━━━━━━━━━━╮\n┃ 🏪 LOJA DO TOGI ┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n${lines.join('\n\n')}\n\n💡 Use .comprar <item>`);
  }
};
