import { getMentionedJid } from '../../utils/targets.js';
import { ensureUser, transferPet } from '../../database/index.js';
import { getFreshPet } from '../../services/pets.js';

export default {
  name: 'doarpet',
  aliases: ['doarpet'] ,
  async execute({ sender, message, args, reply }) {
    const target = getMentionedJid(message);
    if (!target || target === sender) return reply('🐾 Marque quem vai receber o pet. Ex.: .doarpet 1 @pessoa');

    const pet = getFreshPet(sender, args[0]);
    if (!pet) return reply('❌ Pet não encontrado. Use o ID ou nome dele.');
    if (pet.status === 'morto') return reply('🪦 Você não pode doar um pet que já morreu.');

    ensureUser(target);
    const transferred = transferPet(pet.id, sender, target);
    if (!transferred) return reply('❌ Não foi possível transferir esse pet.');

    await reply(`🎁 PET DOADO!\n\n🐾 ${pet.name} foi entregue ao novo dono.\n❤️ Saúde: ${pet.health}/100\n🍖 Fome: ${pet.hunger}/100\n💧 Sede: ${pet.thirst}/100`);
  }
};
