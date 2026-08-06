import { getItemQuantity, getPet, updatePet, addItem } from '../../database/index.js';
import { getFreshPet } from '../../services/pets.js';

export default {
  name: 'alimentar',
  aliases: ['feed'],
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('🐾 Informe o ID ou nome do pet. Ex.: .alimentar Rex');
    if (pet.status === 'morto') return reply(`🪦 ${pet.name} não pode mais receber ações porque morreu.`);
    if (getItemQuantity(sender, 'food') < 1) return reply('🍖 Você não tem comida. Compre na .loja.');

    addItem(sender, 'food', -1);
    const hunger = Math.min(100, pet.hunger + 30);
    const happiness = Math.min(100, pet.happiness + 5);
    updatePet(pet.id, { hunger, happiness, last_needs_update: Date.now() });
    await reply(`🍖 ${pet.name} foi alimentado!\n\n🍖 Fome: ${hunger}/100\n💧 Sede: ${pet.thirst}/100\n😊 Felicidade: ${happiness}/100`);
  }
};
