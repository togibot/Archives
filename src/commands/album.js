import { getUserCards } from '../database/index.js';
import { CARDS, CARD_RARITIES } from '../data/cards.js';

export default {
  name: 'album',
  aliases: ['colecao'],
  category: 'cards',
  description: 'Mostra as cartas que você possui, incluindo repetidas.',
  async execute({ sender, reply }) {
    const owned = new Map(getUserCards(sender).map(row => [row.card_id, row.quantity]));
    const sections = [];
    let repeatedTotal = 0;

    for (const [rarity, info] of Object.entries(CARD_RARITIES)) {
      const cards = CARDS.filter(card => card.rarity === rarity && owned.has(card.id));
      if (!cards.length) continue;
      const total = CARDS.filter(card => card.rarity === rarity).length;
      const ownedCount = cards.length;
      const lines = cards.map(card => {
        const quantity = owned.get(card.id) || 0;
        if (quantity > 1) repeatedTotal += quantity - 1;
        return `${info.emoji} ${card.name}${quantity > 1 ? ` ×${quantity}` : ''}`;
      });
      sections.push(`${info.emoji} *${info.label}* — ${ownedCount}/${total}\n${lines.join('\n')}`);
    }

    const ogs = CARDS.filter(card => card.status === 'OG' && owned.has(card.id));
    for (const card of ogs) {
      const quantity = owned.get(card.id) || 0;
      if (quantity > 1) repeatedTotal += quantity - 1;
    }

    const totalOwned = owned.size;
    const totalCards = CARDS.length;
    const ogSection = ogs.length
      ? `👑 *OG*\n${ogs.map(card => `👑 ${card.name}${owned.get(card.id) > 1 ? ` ×${owned.get(card.id)}` : ''}`).join('\n')}`
      : '👑 *OG*\n❔ Nenhum OG desbloqueado';

    const repeatedCards = [...owned.entries()]
      .filter(([, quantity]) => quantity > 1)
      .map(([cardId, quantity]) => {
        const card = CARDS.find(item => item.id === cardId);
        if (!card) return null;
        const emoji = card.status === 'OG' ? '👑' : CARD_RARITIES[card.rarity]?.emoji || '🎴';
        return `${emoji} ${card.name} ×${quantity} *(+${quantity - 1} repetida${quantity - 1 === 1 ? '' : 's'})*`;
      })
      .filter(Boolean);

    const repeatedSection = repeatedCards.length
      ? `\n🔁 *REPETIDAS* — ${repeatedTotal}\n${repeatedCards.join('\n')}`
      : '\n🔁 *REPETIDAS*\nNenhuma carta repetida.';

    return reply(`╭━━━〔 🎴 𝐓𝐎𝐆𝐈 𝐀𝐋𝐁𝐔𝐌 〕━━━╮\n┃ 📚 Coleção: *${totalOwned}/${totalCards}*\n┃\n${ogSection}\n\n${sections.length ? sections.join('\n\n') : '📭 Você ainda não possui cartas.'}${repeatedSection}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
