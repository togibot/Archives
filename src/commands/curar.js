import { ensureUser, updatePet } from '../database/index.js';
import { getFreshPet } from '../services/pets.js';

export default {
  name: 'curar',
  category: 'pets',
  description: 'Recupera a Vida de um Pet vivo.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Escolha um Pet válido.');
    if (pet.status === 'morto') return reply('🪦 ' + pet.name + ' não pode ser curado porque já morreu.');
    if (Number(pet.health) >= 100) return reply('❤️ ' + pet.name + ' já está com a Vida cheia.');
    updatePet(pet.id, { health: 100, last_needs_update: Date.now(), status: 'vivo' });
    return reply('💚 ' + pet.name + ' foi curado!\n❤️ Vida: 100/100');
  }
};