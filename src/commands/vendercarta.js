import { ensureUser, getCardQuantity, removeCard, addTokens } from '../database/index.js';
import { findCard, CARD_RARITIES } from '../data/cards.js';

const VALUES = { comum: 50, incomum: 80, rara: 125, epica: 200, lendaria: 350, mitica: 600, secreta: 1000 };

export default {
  name: 'vendercarta',
  aliases: ['vendecarta', 'vender'],
  category: 'cards',
  description: 'Vende uma carta repetida por Tokens.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const card = findCard(args.join(' '));
    if (!card) return reply('❌ Carta não encontrada. Use *.album* para ver suas cartas.');
    if (card.status === 'OG') return reply('👑 Cartas OG são exclusivas e não podem ser vendidas.');
    const quantity = getCardQuantity(sender, card.id);
    if (quantity < 2) return reply('❌ Você precisa ter pelo menos 2 cópias dessa carta para vender uma e manter a original no álbum.');
    const value = VALUES[card.rarity] || 25;
    removeCard(sender, card.id, 1);
    addTokens(sender, value);
    const info = CARD_RARITIES[card.rarity];
    return reply(`💰 Você vendeu uma cópia de *${card.name}* ${info.emoji} e recebeu *${value} 🪙*.\n📚 Cópias restantes: *${quantity - 1}*.`);
  }
};
