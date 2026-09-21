import { pets } from '../../data/catalog.js';
import { createPet, getUser, updateUser, addTogiLog } from '../../database/index.js';
import { distributeGroupPurchase } from '../../services/group-tax.js';

export default {
  name: 'comprarpet',
  aliases: ['adotarpet'],
  category: 'economy',
  async execute({ sender, args, reply, chat, isGroup, sock }) {
    const id = args[0]?.toLowerCase();
    const pet = pets[id];
    if (!pet) return reply('❌ Pet inválido. Use .petshop para ver o catálogo.');

    const user = getUser(sender);
    const shopLevel = Number(user?.pet_shop_level || 1);
    if (shopLevel < pet.shopLevel) {
      return reply(`🔒 Este pet está bloqueado!\n🏪 Sua Pet Shop: nível ${shopLevel}\n🔓 Necessário: nível ${pet.shopLevel}\n\nUse .upgradepetshop para melhorar a loja.`);
    }

    if (user.tokens < pet.price) {
      return reply(`❌ Você precisa de 🪙 ${pet.price} Tokens. Saldo: 🪙 ${user.tokens}.`);
    }

    const name = args.slice(1).join(' ').slice(0, 20) || pet.name;
    updateUser(sender, { tokens: user.tokens - pet.price });
    const created = createPet(sender, name, id);

    let groupName = 'Conversa privada';
    if (isGroup) {
      const metadata = await sock.groupMetadata(chat);
      groupName = metadata?.subject || chat;
      distributeGroupPurchase({ amount: pet.price, groupJid: chat, metadata });
    }

    addTogiLog({
      actorJid: sender,
      actorName: user.name || sender.split('@')[0],
      targetJid: sender,
      targetName: user.name || sender.split('@')[0],
      groupJid: isGroup ? chat : null,
      groupName,
      action: `compra: ${pet.emoji || ''} ${created.name || pet.name}`.trim(),
      amount: pet.price
    });

    await reply(`🎉 PET ADQUIRIDO!\n\n${pet.emoji} ${created.name}\n🏷️ ${pet.tier}\n❤️ Saúde: 100\n🍖 Fome: 100\n💧 Sede: 100\n😊 Felicidade: 100\n\n🪙 -${pet.price} Tokens`);
  }
};