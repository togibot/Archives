import { shopItems } from '../../data/catalog.js';
import { addItem, getUser, updateUser, addTogiLog } from '../../database/index.js';
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

    let groupName = 'Conversa privada';
    if (isGroup) {
      const metadata = await sock.groupMetadata(chat);
      groupName = metadata?.subject || chat;
      distributeGroupPurchase({ amount: item.price, groupJid: chat, metadata });
    }

    addTogiLog({
      actorJid: sender,
      actorName: user.name || sender.split('@')[0],
      targetJid: sender,
      targetName: user.name || sender.split('@')[0],
      groupJid: isGroup ? chat : null,
      groupName,
      action: `compra: ${item.name}`,
      amount: item.price
    });

    await reply(`✅ Compra realizada!\n\n${item.name}\n🪙 -${item.price} Tokens\n💰 Saldo: ${getUser(sender).tokens} Tokens`);
  }
};