import { getFreshPet } from '../../services/pets.js';
import { pets } from '../../data/catalog.js';

export default {
  name: 'petinfo',
  aliases: ['pet'],
  category: 'pets',
  description: 'Mostra detalhes de um pet',
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Pet não encontrado. Use .meupet.');
    const info = pets[pet.species];
    const status = pet.status === 'morto' ? '🪦 Morto' : '💚 Vivo';
    return reply(`╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🐾 𝙿𝙴𝚃 • ${pet.name}\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${info?.emoji || '🐾'} Espécie: ${info?.name || pet.species}\n📌 Status: ${status}\n❤️ Saúde: ${pet.health}/100\n🍖 Fome: ${pet.hunger}/100\n💧 Sede: ${pet.thirst}/100\n😊 Felicidade: ${pet.happiness}/100\n🆔 ID: ${pet.id}`);
  }
};
