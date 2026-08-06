import config from '../../config.js';
import { shopItems } from '../../data/catalog.js';
import { addItem, getUser, updateUser } from '../../database/index.js';

export default {
  name: 'comprar',
  aliases: ['buy'],
  async execute({ sender, args, reply }) {
    const id = args[0]?.toLowerCase();
    const item = shopItems[id];
    if (!item) return reply(`❌ Item inválido. Use .loja para ver os produtos.`);
    const user = getUser(sender);
    if (user.tokens < item.price) return reply(`❌ Você precisa de 🪙 ${item.price} Tokens. Seu saldo: 🪙 ${user.tokens}.`);
    updateUser(sender, { tokens: user.tokens - item.price });
    addItem(sender, id, 1);
    await reply(`✅ Compra realizada!\n\n${item.name}\n🪙 -${item.price} Tokens\n💰 Saldo: ${getUser(sender).tokens} Tokens`);
  }
};
