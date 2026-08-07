import { ensureUser, getCardQuantity, removeCard, addTokens } from '../database/index.js';
import { getCard, CARD_RARITIES } from '../data/cards.js';

const VALUES = { comum: 50, incomum: 80, rara: 125, epica: 200, lendaria: 350, mitica: 600, secreta: 1000 };

export default {
  name: 'vendercarta',
  aliases: ['vendecarta', 'vender'],
  category: 'cards',
  description: 'Vende uma carta repetida por Tokens.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const cardId = args[0]?.toLowerCase();
    const card = getCard(cardId);
    if (!card) return reply('❌ Carta não encontrada. Use *.album* para ver suas cartas.');
    const quantity = getCardQuantity(sender, card.id);
    if (quantity < 2) return reply('❌ Você precisa ter pelo menos 2 cópias dessa carta para vender uma e manter a original no álbum.');
    const value = VALUES[card.rarity] || 25;
    removeCard(sender, card.id, 1);
    addTokens(sender, value);
    const info = CARD_RARITIES[card.rarity];
    return reply(`💰 Você vendeu uma cópia de *${card.name}* ${info.emoji} e recebeu *${value} 🪙*.\n📚 Cópias restantes: *${quantity - 1}*.`);
  }
};
