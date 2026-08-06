import { petShopUpgrades } from '../../data/catalog.js';
import { getUser, updateUser } from '../../database/index.js';

export default {
  name: 'upgradepetshop',
  aliases: ['melhorarpetshop', 'upgradelojapets'],
  category: 'economy',
  async execute({ sender, reply }) {
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

    await reply(`🎉 PET SHOP APRIMORADA!\n\n🏪 Nível: ${current} ➜ ${next}\n🔓 Desbloqueado: ${upgrade.unlocks}\n🪙 Custo: ${upgrade.price} Tokens\n💰 Saldo: ${user.tokens - upgrade.price} Tokens\n\nUse .petshop para ver os novos pets!`);
  }
};
