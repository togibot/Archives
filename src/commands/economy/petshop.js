import { pets } from '../../data/catalog.js';

export default {
  name: 'petshop',
  aliases: ['lojapets'],
  async execute({ reply }) {
    const list = Object.entries(pets).map(([id, pet]) => `${pet.emoji} ${pet.name} — 🪙 ${pet.price} Tokens\n   ID: ${id}`).join('\n\n');
    await reply(`╭━━━━━━━━━━━━━━━━━━╮\n┃ 🐾 PET SHOP       ┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n${list}\n\n💡 .comprarpet <id> [nome]`);
  }
};
