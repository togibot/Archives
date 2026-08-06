import { getMentionedJid } from '../../utils/targets.js';
import { getPet, transferPet, ensureUser } from '../../database/index.js';

export default {
  name: 'doarpet',
  async execute({ sender, message, args, reply }) {
    const target = getMentionedJid(message);
    if (!target || target === sender) return reply('🐾 Marque quem vai receber o pet.');
    const pet = getPet(sender, args[0]);
    if (!pet) return reply('❌ Pet não encontrado. Use o ID ou nome dele.');
    ensureUser(target);
    transferPet(pet.id, sender, target);
    await reply(`🎁 Pet doado com sucesso!\n\n🐾 ${pet.name} agora pertence ao novo dono.`);
  }
};
