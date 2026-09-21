import { petShopUpgrades } from '../../data/catalog.js';
import { getUser, updateUser, addTogiLog } from '../../database/index.js';
import { distributeGroupPurchase } from '../../services/group-tax.js';

export default {
  name: 'upgradepetshop',
  aliases: ['melhorarpetshop', 'upgradelojapets'],
  category: 'economy',
  async execute({ sender, reply, chat, isGroup, sock }) {
    const user = getUser(sender);
    const current = Number(user?.pet_shop_level || 1);
    const next = current + 1;
    const upgrade = petShopUpgrades[next];

    if (!upgrade) return reply('👑 Sua Pet Shop já está no nível máximo (5).');
    if (user.tokens < upgrade.price) {
      return reply(`❌ Tokens insuficientes.\n🪙 Você tem: ${user.tokens}\n💰 Precisa: ${upgrade.price}`);
    }

    updateUser(sender, {
      tokens: user.tokens - upgrade.price,
      pet_shop_level: next
    });

    let groupName = 'Conversa privada';
    if (isGroup) {
      const metadata = await sock.groupMetadata(chat);
      groupName = metadata?.subject || chat;
      distributeGroupPurchase({ amount: upgrade.price, groupJid: chat, metadata });
    }

    addTogiLog({
      actorJid: sender,
      actorName: user.name || sender.split('@')[0],
      targetJid: sender,
      targetName: user.name || sender.split('@')[0],
      groupJid: isGroup ? chat : null,
      groupName,
      action: `compra: Upgrade Pet Shop ${current} → ${next}`,
      amount: upgrade.price
    });

    await reply(`🎉 PET SHOP APRIMORADA!\n\n🏪 Nível: ${current} ➜ ${next}\n🔓 Desbloqueado: ${upgrade.unlocks}\n🪙 Custo: ${upgrade.price} Tokens\n💰 Saldo: ${user.tokens - upgrade.price} Tokens\n\nUse .petshop para ver os novos pets!`);
  }
};