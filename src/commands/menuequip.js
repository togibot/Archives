import { ensureUser } from '../database/index.js';
import { getEquippedPets, getPetSlots } from '../database/index.js';
import { getPetDefinition, PET_SLOT_UPGRADES } from '../data/pets.js';

export default {
  name: 'menuequip',
  aliases: ['menuequipados'],
  category: 'pets',
  description: 'Mostra os Pets equipados e os slots disponíveis.',
  async execute({ sender, reply }) {
    ensureUser(sender);
    const slots = getPetSlots(sender);
    const equipped = getEquippedPets(sender);
    const maxSlots = Number(slots.max_slots || 1);
    const lines = [
      '╭━━━〔 🐾 𝐏𝐄𝐓𝐒 𝐄𝐐𝐔𝐈𝐏𝐀𝐃𝐎𝐒 〕━━━╮',
      '┃ 📦 Espaços: ' + equipped.length + '/' + maxSlots
    ];
    if (!equipped.length) {
      lines.push('┃', '┃ Nenhum Pet equipado.', '┃ 💡 Use .equip <ID ou nome>');
    } else {
      for (const pet of equipped) {
        const def = getPetDefinition(pet.species);
        const emoji = def ? def.emoji : '🐾';
        const ability = def ? def.abilityName : 'Habilidade desconhecida';
        lines.push('┃', '┃ [' + pet.slot + '] ' + emoji + ' ' + pet.name + ' — ' + (def ? def.name : pet.species));
        lines.push('┃    ⭐ ' + (def ? def.rarity : 'Desconhecida') + ' • ⚡ ' + ability);
      }
    }
    if (maxSlots < 10) {
      const cost = PET_SLOT_UPGRADES[maxSlots + 1];
      if (cost) lines.push('┃', '┃ 🔒 Próximo slot: 🪙 ' + cost.toLocaleString('pt-BR') + ' Tokens');
    } else {
      lines.push('┃', '┃ 👑 Limite máximo de slots atingido.');
    }
    lines.push('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
    lines.push('💡 .equip <ID ou nome> • .unequip <ID ou nome> • .upgradeequip');
    return reply(lines.join('\n'));
  }
};