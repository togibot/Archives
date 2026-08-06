import { getFreshPet } from '../../services/pets.js';
import { updatePet } from '../../database/index.js';

export default {
  name: 'dormir',
  aliases: ['dormirpet'],
  category: 'pets',
  description: 'Deixa o pet descansar',
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Escolha um pet válido.');
    if (pet.status === 'morto') return reply(`🪦 ${pet.name} não pode mais descansar porque morreu.`);

    const health = Math.min(100, pet.health + 10);
    const happiness = Math.min(100, pet.happiness + 5);
    updatePet(pet.id, { health, happiness, last_needs_update: Date.now() });
    return reply(`😴 ${pet.name} descansou!\n❤️ Saúde: ${health}/100\n😊 Felicidade: ${happiness}/100\n🍖 Fome: ${pet.hunger}/100\n💧 Sede: ${pet.thirst}/100`);
  }
};
