import { pets } from '../../data/catalog.js';
import { getUser } from '../../database/index.js';

export default {
  name: 'petshop',
  aliases: ['lojapets'],
  category: 'economy',
  async execute({ sender, reply }) {
    const user = getUser(sender);
    const level = Number(user?.pet_shop_level || 1);
    const order = ['Comum', 'Raro', 'Épico', 'Lendário', 'Secreto'];
    const sections = [];

    for (const tier of order) {
      const entries = Object.entries(pets).filter(([, pet]) => pet.tier === tier);
      if (!entries.length) continue;
      sections.push(`${tier}\n${entries.map(([id, pet]) => {
        const unlocked = level >= pet.shopLevel;
        return `${unlocked ? '🟢' : '🔒'} ${id} — ${pet.emoji} ${pet.name} — 🪙 ${pet.price}${unlocked ? '' : ` | Nv.${pet.shopLevel}`}`;
      }).join('\n')}`);
    }

    const next = level < 5
      ? `\n\n⬆️ Próximo upgrade: .upgradepetshop\n🔓 Loja atual: ${level}/5`
      : '\n\n👑 PET SHOP NO NÍVEL MÁXIMO!';

    await reply(`╭━━━〔 🐾 PET SHOP 〕━━━╮\n┃ 🏪 Nível: ${level}/5\n┃ 🪙 Saldo: ${user.tokens} Tokens\n╰━━━━━━━━━━━━━━━━━━╯\n\n${sections.join('\n\n')}${next}\n\n💡 Comprar: .comprarpet <id> [nome]`);
  }
};
