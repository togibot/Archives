import { ensureUser, spendTokens, addCard } from '../database/index.js';
import { drawCard, CARD_RARITIES } from '../data/cards.js';

const PACK_PRICE = 500;

export default {
  name: 'pack',
  aliases: ['pacote', 'packcartas'],
  category: 'cards',
  description: `Compra um Pack de Cartas com 4 cartas por ${PACK_PRICE} Tokens.`,
  async execute({ sender, reply }) {
    ensureUser(sender);
    if (!spendTokens(sender, PACK_PRICE)) {
      return reply(`❌ Você precisa de *${PACK_PRICE} 🪙* para comprar um Pack de Cartas.`);
    }
    const cards = Array.from({ length: 4 }, () => drawCard());
    cards.forEach(card => addCard(sender, card.id, 1));
    const lines = cards.map((card, index) => {
      const info = CARD_RARITIES[card.rarity];
      return `${index + 1}. ${info.emoji} *${card.name}* — ${info.label}${card.status === 'OG' ? ' 👑 OG' : ''}`;
    });
    return reply(`╭━━━〔 📦 𝐏𝐀𝐂𝐊 𝐃𝐄 𝐂𝐀𝐑𝐓𝐀𝐒 〕━━━╮\n┃ 💰 Custo: *${PACK_PRICE} 🪙*\n┃ 🎴 Cartas recebidas: *4*\n┃\n${lines.join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n💡 Cartas repetidas podem ser vendidas ou doadas.`);
  }
};
