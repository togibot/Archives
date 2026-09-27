import { ensureUser, getPet } from '../database/index.js';
import { getPetDefinition } from '../data/pets.js';
import { getFreshPet } from '../services/pets.js';
import { getPetLevelProgress, getPetAbilityCooldownRemaining } from '../services/pet-abilities.js';

export default {
  name: 'petinfo',
  category: 'pets',
  description: 'Mostra informações completas de um Pet.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const query = args.join(' ').trim();
    if (!query) return reply('🐾 Informe o ID ou nome do Pet.\n💡 Ex.: .petinfo 1');
    const pet = getFreshPet(sender, query);
    if (!pet) return reply('❌ Não encontrei esse Pet na sua coleção.');
    const def = getPetDefinition(pet.species);
    if (!def) return reply('❌ Esse Pet usa uma espécie que não existe mais no catálogo atual.');
    const status = String(pet.status || 'vivo') === 'vivo' ? '🟢 Vivo' : '⚫ ' + pet.status;
    const progress = getPetLevelProgress(pet);
    const cooldownMs = getPetAbilityCooldownRemaining(pet);
    const cooldown = cooldownMs > 0 ? Math.ceil(cooldownMs / 60000) + ' min' : 'Disponível';
    return reply('╭━━━〔 ' + def.emoji + ' 𝐏𝐄𝐓 𝐈𝐍𝐅𝐎 〕━━━╮\n' +
      '┃ 🆔 ID: ' + pet.id + '\n' +
      '┃ 🐾 Nome: ' + pet.name + '\n' +
      '┃ 🐾 Espécie: ' + def.name + '\n' +
      '┃ ⭐ Raridade: ' + def.rarity + '\n' +
      '┃ ⚡ Habilidade: ' + def.abilityName + '\n' +
      '┃ 📖 ' + def.abilityDescription + '\n' +
      '┃ 🎚️ Nível: ' + Number(pet.level || 1) + '\n' +
      '┃ ✨ XP: ' + progress.xp + '/' + progress.needed + ' (' + progress.percent + '%)\n' +
      '┃ ⏱️ Habilidade: ' + cooldown + '\n' +
      '┃ ❤️ Vida: ' + Number(pet.health || 0) + '/100\n' +
      '┃ 🍖 Fome: ' + Number(pet.hunger || 0) + '/100\n' +
      '┃ 💧 Sede: ' + Number(pet.thirst || 0) + '/100\n' +
      '┃ 😊 Felicidade: ' + Number(pet.happiness || 0) + '/100\n' +
      '┃ 📊 Status: ' + status + '\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
  }
};