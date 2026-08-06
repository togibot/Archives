import { getItemQuantity, addItem, updatePet } from '../../database/index.js';
import { getFreshPet } from '../../services/pets.js';

export default {
  name: 'daragua',
  aliases: ['beberpet', 'agua'],
  category: 'pets',
  description: 'Dá água ao pet',
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Escolha um pet válido.');
    if (pet.status === 'morto') return reply(`🪦 ${pet.name} não pode mais beber água porque morreu.`);
    if (getItemQuantity(sender, 'water') < 1) return reply('💧 Você não tem água. Compre na .loja.');

    addItem(sender, 'water', -1);
    const thirst = Math.min(100, pet.thirst + 35);
    const happiness = Math.min(100, pet.happiness + 3);
    updatePet(pet.id, { thirst, happiness, last_needs_update: Date.now() });
    await reply(`💧 ${pet.name} bebeu água!\n\n💧 Sede: ${thirst}/100\n🍖 Fome: ${pet.hunger}/100\n😊 Felicidade: ${happiness}/100`);
  }
};
