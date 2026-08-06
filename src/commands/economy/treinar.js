import { updatePet } from '../../database/index.js';
import { getFreshPet } from '../../services/pets.js';

export default {
  name: 'treinar',
  aliases: ['treinopet'],
  category: 'pets',
  description: 'Treina seu pet',
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Escolha um pet válido.');
    if (pet.status === 'morto') return reply(`🪦 ${pet.name} não pode mais treinar porque morreu.`);
    if (pet.hunger <= 15 || pet.thirst <= 15) return reply(`⚠️ ${pet.name} precisa estar bem cuidado antes do treino.\n🍖 Fome: ${pet.hunger}/100\n💧 Sede: ${pet.thirst}/100`);

    const happiness = Math.min(100, pet.happiness + 8);
    const hunger = Math.max(0, pet.hunger - 6);
    const thirst = Math.max(0, pet.thirst - 8);
    updatePet(pet.id, { happiness, hunger, thirst, last_needs_update: Date.now() });
    return reply(`🏋️ ${pet.name} treinou!\n💪 O pet ganhou experiência de treinamento.\n😊 Felicidade: ${happiness}/100\n🍖 Fome: ${hunger}/100\n💧 Sede: ${thirst}/100`);
  }
};
