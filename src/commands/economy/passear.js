import { updatePet } from '../../database/index.js';
import { getFreshPet, getWalkInfo, registerWalk, PET_RULES } from '../../services/pets.js';

const scenes = [
  '🌳 correu pelo parque',
  '🌤️ explorou uma praça',
  '🌿 cheirou todas as árvores do caminho',
  '🐾 encontrou outro pet pelo caminho',
  '🏞️ deu uma volta pela vizinhança'
];

export default {
  name: 'passear',
  aliases: ['passeio', 'caminhar'],
  category: 'pets',
  description: 'Passeia com seu pet até 4 vezes por dia',
  async execute({ sender, args, reply }) {
    const pet = getFreshPet(sender, args[0] || '1');
    if (!pet) return reply('❌ Escolha um pet válido. Ex.: .passear 1');
    if (pet.status === 'morto') return reply(`🪦 ${pet.name} não pode passear porque morreu.`);

    const info = getWalkInfo(pet);
    if (info.count >= PET_RULES.maxWalksPerDay) {
      return reply(`🐾 ${pet.name} já passeou ${PET_RULES.maxWalksPerDay} vezes hoje.\n⏳ O limite volta amanhã.`);
    }
    if (pet.hunger <= 10 || pet.thirst <= 10) {
      return reply(`⚠️ ${pet.name} está fraco para passear.\n🍖 Fome: ${pet.hunger}/100\n💧 Sede: ${pet.thirst}/100\n\nAlimente e dê água antes.`);
    }

    const walk = registerWalk(pet);
    const hunger = Math.max(0, walk.hunger - 8);
    const thirst = Math.max(0, walk.thirst - 10);
    const happiness = Math.min(100, walk.happiness + 18);
    updatePet(walk.id, { hunger, thirst, happiness, last_needs_update: Date.now() });

    const scene = scenes[Math.floor(Math.random() * scenes.length)];
    await reply(`🐾 PASSEIO!\n\n${pet.name} ${scene}!\n😊 Felicidade: ${happiness}/100\n🍖 Fome: ${hunger}/100\n💧 Sede: ${thirst}/100\n\n🚶 Passeios hoje: ${info.count + 1}/${PET_RULES.maxWalksPerDay}`);
  }
};
