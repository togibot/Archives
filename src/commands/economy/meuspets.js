import { getPets } from '../../database/index.js';
import { pets } from '../../data/catalog.js';

export default {
  name: 'pets',
  aliases: ['meuspets', 'mypets'],
  async execute({ sender, reply }) {
    const list = getPets(sender);
    if (!list.length) return reply('🐾 Você ainda não tem pets. Use .petshop para escolher um.');
    const text = list.map(p => `${pets[p.species]?.emoji || '🐾'} #${p.id} ${p.name}\n❤️ ${p.health}/100 | 🍖 ${p.hunger}/100 | 😊 ${p.happiness}/100`).join('\n\n');
    await reply(`╭━━━━━━━━━━━━━━━━━━╮\n┃ 🐾 MEUS PETS      ┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n${text}`);
  }
};
