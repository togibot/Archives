import { getCard, findCard, CARD_RARITIES } from '../data/cards.js';
import { getCardQuantity } from '../database/index.js';

export default {
  name: 'carta',
  aliases: ['card'],
  category: 'cards',
  description: 'Mostra detalhes de uma carta.',
  async execute({ sender, args, reply }) {
    const card = findCard(args.join(' ')) || getCard(args[0]);
    if (!card) return reply('🎴 Use *.carta <nome ou id>* para consultar uma carta.');
    const quantity = getCardQuantity(sender, card.id);
    const rarity = card.status === 'OG' ? '👑 OG' : `${CARD_RARITIES[card.rarity].emoji} ${CARD_RARITIES[card.rarity].label}`;
    return reply(`╭━━━〔 🎴 𝐂𝐀𝐑𝐓𝐀 〕━━━╮\n┃ 👤 *${card.name}*\n┃ 💎 ${rarity}\n┃ 🆔 ${card.id}\n┃ 📚 Cópias: *${quantity}*\n┃\n┃ 📝 ${card.description}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
