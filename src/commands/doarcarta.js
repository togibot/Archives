import { ensureUser, getCardQuantity, removeCard, addCard } from '../database/index.js';
import { findCard, CARD_RARITIES } from '../data/cards.js';

export default {
  name: 'doarcarta',
  aliases: ['darcard'],
  category: 'cards',
  description: 'Doa uma carta repetida para outro membro.',
  async execute({ sender, args, message, reply }) {
    const target = message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const card = findCard(args.filter(arg => !arg.startsWith('@')).join(' '));
    if (!card || !target) return reply('🎴 Use *.doarcarta <nome-da-carta> @pessoa*.');
    if (target === sender) return reply('❌ Você não pode doar uma carta para si mesmo.');
    if (card.status === 'OG') return reply('👑 Cartas OG são exclusivas e não podem ser doadas.');
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
