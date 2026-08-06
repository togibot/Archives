import { getFreshPet } from '../../services/pets.js';
import { updatePet } from '../../database/index.js';

export default {
  name: 'brincar',
  aliases: ['playpet'],
  category: 'pets',
  description: 'Brinca com seu pet',
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Escolha um pet válido.');
    if (pet.status === 'morto') return reply(`🪦 ${pet.name} não pode mais brincar porque morreu.`);
    if (pet.thirst <= 10 || pet.hunger <= 10) return reply(`⚠️ ${pet.name} está precisando de cuidados antes de brincar.\n🍖 Fome: ${pet.hunger}/100\n💧 Sede: ${pet.thirst}/100`);

    const happiness = Math.min(100, pet.happiness + 20);
    const hunger = Math.max(0, pet.hunger - 5);
    const thirst = Math.max(0, pet.thirst - 5);
    updatePet(pet.id, { happiness, hunger, thirst, last_needs_update: Date.now() });
    return reply(`🎾 ${pet.name} brincou com você!\n😊 Felicidade: ${happiness}/100\n🍖 Fome: ${hunger}/100\n💧 Sede: ${thirst}/100`);
  }
};
