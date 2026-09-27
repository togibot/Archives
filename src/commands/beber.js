import { ensureUser, getItemQuantity, addItem, updatePet } from '../database/index.js';
import { getFreshPet } from '../services/pets.js';

export default {
  name: 'beber',
  aliases: ['agua', 'beberagua'],
  category: 'pets',
  description: 'Dá água a um Pet usando uma unidade de água.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('🐾 Informe o ID ou nome do Pet. Ex.: .beber 1');
    if (pet.status === 'morto') return reply('🪦 ' + pet.name + ' não pode mais receber cuidados porque morreu.');
    if (getItemQuantity(sender, 'water') < 1) return reply('💧 Você não tem água. Compre em .loja.');
    addItem(sender, 'water', -1);
    const thirst = Math.min(100, pet.thirst + 35);
    const happiness = Math.min(100, pet.happiness + 3);
    updatePet(pet.id, { thirst, happiness, last_needs_update: Date.now() });
    return reply('💧 ' + pet.name + ' bebeu água!\n\n💧 Sede: ' + thirst + '/100\n🍖 Fome: ' + pet.hunger + '/100\n😊 Felicidade: ' + happiness + '/100');
  }
};