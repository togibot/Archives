import { ensureUser } from '../database/index.js';
import { getFreshPet } from '../services/pets.js';
import { unequipPet, getPetEquipment } from '../database/index.js';

export default {
  name: 'unequip',
  aliases: ['desequipar'],
  category: 'pets',
  description: 'Remove um Pet do equipamento.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const query = args.join(' ').trim();
    if (!query) return reply('🐾 Informe o ID ou nome do Pet.\n💡 Ex.: .unequip 1');
    const pet = getFreshPet(sender, query);
    if (!pet) return reply('❌ Não encontrei esse Pet na sua coleção.');
    const equipped = getPetEquipment(sender, pet.id);
    if (!equipped) return reply('⚠️ ' + pet.name + ' não está equipado.');
    if (!unequipPet(sender, pet.id)) return reply('❌ Não foi possível desequipar esse Pet.');
    return reply('✅ ' + pet.name + ' foi removido do slot ' + equipped.slot + '.\n🐾 Use .menuEquip para conferir seus espaços.');
  }
};