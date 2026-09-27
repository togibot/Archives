import { ensureUser, getUser, spendTokens, getPetSlots, setPetSlots } from '../database/index.js';
import { PET_SLOT_UPGRADES } from '../data/pets.js';

export default {
  name: 'upgradeequip',
  aliases: ['upgradeslots', 'upgradeslot'],
  category: 'pets',
  description: 'Compra um novo espaço para equipar Pets.',
  async execute({ sender, reply }) {
    ensureUser(sender);
    const slots = getPetSlots(sender);
    const current = Math.max(1, Number(slots.max_slots || 1));
    const next = current + 1;
    const cost = PET_SLOT_UPGRADES[next];
    if (!cost) return reply('👑 Você já atingiu o limite máximo de 10 espaços.');
    const user = getUser(sender);
    const balance = Number(user.tokens || 0);
    if (balance < cost) return reply('❌ Tokens insuficientes.\n📦 Espaços atuais: ' + current + '\n⬆️ Próximo espaço: ' + next + '\n🪙 Custo: ' + cost.toLocaleString('pt-BR') + '\n💳 Seu saldo: ' + balance.toLocaleString('pt-BR'));
    if (!spendTokens(sender, cost)) return reply('❌ Não foi possível concluir o upgrade. Seu saldo pode ter mudado, tente novamente.');
    setPetSlots(sender, next);
    return reply('╭━━━〔 🐾⬆️ 𝐔𝐏𝐆𝐑𝐀𝐃𝐄 𝐃𝐄 𝐒𝐋𝐎𝐓 〕━━━╮\n' +
      '┃ 📦 Espaços: ' + current + ' → ' + next + '\n' +
      '┃ 🪙 Pago: ' + cost.toLocaleString('pt-BR') + ' Tokens\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
  }
};