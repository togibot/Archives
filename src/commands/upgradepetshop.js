import { ensureUser, getUser, spendTokens, updateUser } from '../database/index.js';
import { petShopUpgrades } from '../data/catalog.js';

export default {
  name: 'upgradepetshop',
  aliases: ['upgradelojapet'],
  category: 'pets',
  description: 'Melhora o nível da Pet Shop e desbloqueia raridades.',
  async execute({ sender, reply }) {
    ensureUser(sender);
    const user = getUser(sender);
    const current = Math.max(1, Number(user.pet_shop_level || 1));
    const next = current + 1;
    const upgrade = petShopUpgrades[next];
    if (!upgrade) return reply('🏪 Sua Pet Shop já está no nível máximo disponível (' + current + ').');
    const balance = Number(user.tokens || 0);
    if (balance < upgrade.price) {
      return reply('❌ Tokens insuficientes para melhorar a Pet Shop.\n🏪 Nível atual: ' + current + '\n⬆️ Próximo nível: ' + next + '\n🪙 Custo: ' + upgrade.price.toLocaleString('pt-BR') + '\n💳 Seu saldo: ' + balance.toLocaleString('pt-BR'));
    }
    if (!spendTokens(sender, upgrade.price)) return reply('❌ Não foi possível concluir o upgrade. Seu saldo pode ter mudado, tente novamente.');
    updateUser(sender, { pet_shop_level: next });
    return reply('╭━━━〔 🏪⬆️ 𝐏𝐄𝐓 𝐒𝐇𝐎𝐏 〕━━━╮\n' +
      '┃ 🎚️ Nível: ' + current + ' → ' + next + '\n' +
      '┃ 🔓 Desbloqueado: ' + upgrade.unlocks + '\n' +
      '┃ 🪙 Pago: ' + upgrade.price.toLocaleString('pt-BR') + ' Tokens\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
  }
};