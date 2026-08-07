import { CARDS, CARD_RARITIES } from '../data/cards.js';

export default {
  name: 'cards',
  aliases: ['catalogocartas', 'cartaslista'],
  category: 'cards',
  description: 'Mostra todas as cartas existentes no Togi Cards.',
  async execute({ reply }) {
    const sections = [];

    const ogs = CARDS.filter(card => card.status === 'OG');
    sections.push(`👑 *OG — STATUS ESPECIAL*\n${ogs.map(card => `👑 ${card.name}`).join('\n')}`);

    for (const [rarity, info] of Object.entries(CARD_RARITIES)) {
      const cards = CARDS.filter(card => card.rarity === rarity);
      if (!cards.length) continue;
      sections.push(`${info.emoji} *${info.label}* — ${cards.length}\n${cards.map(card => `${info.emoji} ${card.name}`).join('\n')}`);
    }

    return reply(`╭━━━〔 🎴 𝐓𝐎𝐆𝐈 𝐂𝐀𝐑𝐃𝐒 〕━━━╮\n┃ 📖 *CATÁLOGO COMPLETO*\n┃ Todas as cartas existentes\n┃\n${sections.join('\n\n')}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
