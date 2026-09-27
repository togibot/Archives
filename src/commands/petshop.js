import { ensureUser, getUser } from '../database/index.js';
import { getAllPetDefinitions, PET_RARITY_ORDER } from '../data/pets.js';

const rarityEmoji = {
  Comum: '⚪',
  Raro: '🔵',
  'Épico': '🟣',
  'Lendário': '🟡',
  Secreto: '🔴'
};

export default {
  name: 'petshop',
  category: 'pets',
  description: 'Mostra o Pet Shop e os Pets desbloqueados.',
  async execute({ sender, reply }) {
    ensureUser(sender);
    const user = getUser(sender);
    const shopLevel = Math.max(1, Number(user.pet_shop_level || 1));
    const pets = getAllPetDefinitions();
    const lines = ['╭━━━〔 🛒🐾 𝐏𝐄𝐓 𝐒𝐇𝐎𝐏 〕━━━╮', '┃ 🏪 Nível da loja: ' + shopLevel, '┃'];
    for (const rarity of PET_RARITY_ORDER) {
      const tierPets = pets.filter(pet => pet.rarity === rarity);
      if (!tierPets.length) continue;
      const unlocked = tierPets[0].shopLevel <= shopLevel;
      lines.push('┃ ' + (rarityEmoji[rarity] || '🐾') + ' ' + rarity + (unlocked ? '' : ' 🔒'));
      if (!unlocked) {
        lines.push('┃    🔒 Desbloqueia no nível ' + tierPets[0].shopLevel);
        lines.push('┃');
        continue;
      }
      for (const pet of tierPets) {
        lines.push('┃    ' + pet.emoji + ' ' + pet.name + ' — 🪙 ' + pet.price.toLocaleString('pt-BR'));
        lines.push('┃       ID: ' + pet.id);
      }
      lines.push('┃');
    }
    lines.push('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
    lines.push('🛍️ Compre com .comprarpet <ID ou nome>');
    lines.push('⬆️ Melhore a loja com .upgradepetshop');
    return reply(lines.join('\n'));
  }
};