import { ensureUser } from '../database/index.js';
import { getFreshPet } from '../services/pets.js';
import { equipPet } from '../database/index.js';

export default {
  name: 'equip',
  category: 'pets',
  description: 'Equipa um Pet em um dos slots disponíveis.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const query = args.join(' ').trim();
    if (!query) return reply('🐾 Informe o ID ou nome do Pet.\n💡 Ex.: .equip 1');
    const pet = getFreshPet(sender, query);
    if (!pet) return reply('❌ Não encontrei esse Pet na sua coleção.');
    if (pet.status !== 'vivo') return reply('🪦 ' + pet.name + ' não pode ser equipado porque não está vivo.');
    const result = equipPet(sender, pet.id);
    if (!result.ok) {
      if (result.reason === 'already_equipped') return reply('⚠️ ' + pet.name + ' já está equipado no slot ' + result.slot + '.');
      if (result.reason === 'no_slot') return reply('🔒 Você não tem slots livres.\n📦 Espaços: ' + getSafeNumber(result.slots?.max_slots) + '\n💡 Use .upgradeequip para comprar mais um.');
      return reply('❌ Não foi possível equipar esse Pet.');
    }
    return reply('✅ ' + pet.name + ' foi equipado no slot ' + result.slot + '!\n🐾 Espaços: ' + getSafeNumber(result.slots.max_slots) + '\n💡 Use .menuEquip para visualizar.');
  }
};

function getSafeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 1;
}