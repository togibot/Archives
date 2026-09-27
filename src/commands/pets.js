import { ensureUser, getPets } from '../database/index.js';
import { getFreshPet } from '../services/pets.js';
import { getPetDefinition } from '../data/pets.js';

export default {
  name: 'pets',
  aliases: ['pet', 'meuspets'],
  category: 'pets',
  description: 'Mostra os Pets do usuário.',
  async execute({ sender, reply }) {
    ensureUser(sender);
    const pets = getPets(sender);
    if (!pets.length) return reply('🐾 Você ainda não tem nenhum Pet.\n🛒 Use .petshop para conhecer os Pets disponíveis.');
    const lines = ['╭━━━〔 🐾 𝐒𝐄𝐔𝐒 𝐏𝐄𝐓𝐒 〕━━━╮'];
    for (const [index, rawPet] of pets.entries()) {
      const pet = getFreshPet(sender, rawPet.id) || rawPet;
      const def = getPetDefinition(pet.species);
      const emoji = def ? def.emoji : '🐾';
      const rarity = def ? def.rarity : 'Desconhecida';
      const species = def ? def.name : pet.species;
      lines.push((index + 1) + '. ' + emoji + ' ' + pet.name + ' — ' + species);
      lines.push('   ' + rarity + ' • ❤️ ' + pet.health + ' • 🍖 ' + pet.hunger + ' • 💧 ' + pet.thirst + ' • 😊 ' + pet.happiness);
    }
    lines.push('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
    lines.push('💡 Use .petinfo <ID> para ver um Pet com mais detalhes.');
    return reply(lines.join('\n'));
  }
};