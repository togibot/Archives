import { getItemQuantity, getPet, updatePet, addItem } from '../../database/index.js';

export default {
  name: 'alimentar',
  aliases: ['feed'],
  async execute({ sender, args, reply }) {
    const pet = getPet(sender, args[0]);
    if (!pet) return reply('🐾 Informe o ID ou nome do pet. Ex.: .alimentar Rex');
    if (getItemQuantity(sender, 'food') < 1) return reply('🍖 Você não tem comida. Compre na .loja.');
    addItem(sender, 'food', -1);
    const hunger = Math.min(100, pet.hunger + 25);
    const happiness = Math.min(100, pet.happiness + 5);
    updatePet(pet.id, { hunger, happiness });
    await reply(`🍖 ${pet.name} foi alimentado!\n\n🍖 Fome: ${hunger}/100\n😊 Felicidade: ${happiness}/100`);
  }
};
