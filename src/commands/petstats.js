import { getTopPets } from '../database/index.js';
import { refreshAllPets } from '../services/pets.js';

export default {
  name: 'petstats',
  aliases: ['toppets'],
  category: 'pets',
  description: 'Mostra o ranking de Pets.',
  async execute({ reply }) {
    refreshAllPets();
    const rows = getTopPets(10);
    const body = rows.map((p, i) => (i + 1) + '. 🐾 ' + p.name + ' (' + p.species + ') — ❤️ ' + p.health + ' | 😊 ' + p.happiness).join('\n') || 'Ainda não há Pets.';
    return reply('╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🏆 𝚃𝙾𝙿 𝙿𝙴𝚃𝚂\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n' + body);
  }
};