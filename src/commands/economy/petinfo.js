import { getPet } from '../../database/index.js';
export default { name:'petinfo', aliases:['pet'], category:'pets', description:'Mostra detalhes de um pet', async execute({ sender,args,reply }) {
  const pet=getPet(sender,args[0] || '1'); if(!pet) return reply('❌ Pet não encontrado. Use .meuspets.');
  return reply(`╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🐾 𝙿𝙴𝚃 • ${pet.name}\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n🐶 Espécie: ${pet.species}\n❤️ Saúde: ${pet.health}/100\n🍖 Fome: ${pet.hunger}/100\n😊 Felicidade: ${pet.happiness}/100`);
} };
