import { getUserCards } from '../database/index.js';
import { CARDS, CARD_RARITIES } from '../data/cards.js';

export default {
  name: 'album',
  aliases: ['cartas', 'colecao', 'colecao'],
  category: 'cards',
  description: 'Mostra as cartas que você possui organizadas por raridade.',
  async execute({ sender, reply }) {
    const owned = new Map(getUserCards(sender).map(row => [row.card_id, row.quantity]));
    const sections = [];
    for (const [rarity, info] of Object.entries(CARD_RARITIES)) {
      const cards = CARDS.filter(card => card.rarity === rarity && owned.has(card.id));
      if (!cards.length) continue;
      const total = CARDS.filter(card => card.rarity === rarity).length;
      const ownedCount = cards.length;
      const lines = cards.map(card => `${info.emoji} ${card.name}${owned.get(card.id) > 1 ? ` ×${owned.get(card.id)}` : ''}`);
      sections.push(`${info.emoji} *${info.label}* — ${ownedCount}/${total}\n${lines.join('\n')}`);
    }
    const ogs = CARDS.filter(card => card.status === 'OG' && owned.has(card.id));
    const totalOwned = owned.size;
    const totalCards = CARDS.length;
    const ogSection = ogs.length ? `👑 *OG*\n${ogs.map(card => `👑 ${card.name}`).join('\n')}` : '👑 *OG*\n❔ Nenhum OG desbloqueado';
    return reply(`╭━━━〔 🎴 𝐓𝐎𝐆𝐈 𝐀𝐋𝐁𝐔𝐌 〕━━━╮\n┃ 📚 Coleção: *${totalOwned}/${totalCards}*\n┃\n${ogSection}\n\n${sections.length ? sections.join('\n\n') : '📭 Você ainda não possui cartas.'}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
