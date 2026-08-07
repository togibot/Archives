import { ensureUser, getCardQuantity, removeCard, addCard } from '../database/index.js';
import { getCard, CARD_RARITIES } from '../data/cards.js';

export default {
  name: 'doarcarta',
  aliases: ['doarcarta', 'darcard'],
  category: 'cards',
  description: 'Doa uma carta repetida para outro membro.',
  async execute({ sender, args, reply }) {
    const cardId = args[0]?.toLowerCase();
    const target = (args[1] || '').includes('@') ? args[1].replace(/\D/g, '') + '@s.whatsapp.net' : null;
    if (!cardId || !target) return reply('🎴 Use *.doarcarta <id-da-carta> @pessoa*.');
    const card = getCard(cardId);
    if (!card) return reply('❌ Carta não encontrada.');
    if (target === sender) return reply('❌ Você não pode doar uma carta para si mesmo.');
    ensureUser(sender);
    ensureUser(target);
    const quantity = getCardQuantity(sender, card.id);
    if (quantity < 2) return reply('❌ Você só pode doar uma cópia repetida. Mantenha pelo menos uma no seu álbum.');
    removeCard(sender, card.id, 1);
    addCard(target, card.id, 1);
    const info = CARD_RARITIES[card.rarity];
    return reply(`🎁 @${sender.split('@')[0]} doou ${info.emoji} *${card.name}* para @${target.split('@')[0]}!\n📚 O doador ficou com *${quantity - 1}* cópia(s).`, { mentions: [sender, target] });
  }
};
