import { shopItems } from '../../data/catalog.js';
import { addItem, getUser, updateUser } from '../../database/index.js';
import { distributeGroupPurchase } from '../../services/group-tax.js';

export default {
  name: 'comprar',
  aliases: ['buy'],
  async execute({ sender, args, reply, chat, isGroup, sock }) {
    const id = args[0]?.toLowerCase();
    const item = shopItems[id];
    if (!item) return reply('❌ Item inválido. Use .loja para ver os produtos.');

    const user = getUser(sender);
    if (user.tokens < item.price) {
      return reply(`❌ Você precisa de 🪙 ${item.price} Tokens. Seu saldo: 🪙 ${user.tokens}.`);
    }

    updateUser(sender, { tokens: user.tokens - item.price });
    addItem(sender, id, 1);

    if (isGroup) {
      const metadata = await sock.groupMetadata(chat);
      distributeGroupPurchase({ amount: item.price, groupJid: chat, metadata });
    }

    await reply(`✅ Compra realizada!\n\n${item.name}\n🪙 -${item.price} Tokens\n💰 Saldo: ${getUser(sender).tokens} Tokens`);
  }
};
