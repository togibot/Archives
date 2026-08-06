import { addItem, ensureUser, getItemQuantity } from '../../database/index.js';
import { getMentionedJid } from '../../utils/targets.js';

export default {
  name: 'doarcomida',
  async execute({ sender, message, args, reply }) {
    const target = getMentionedJid(message);
    const quantity = Math.max(1, Math.floor(Number(args.find(a => /^\d+$/.test(a))) || 1));
    if (!target || target === sender) return reply('🍖 Marque quem vai receber a comida.');
    if (getItemQuantity(sender, 'food') < quantity) return reply(`❌ Você não tem ${quantity} comida(s).`);
    ensureUser(target);
    addItem(sender, 'food', -quantity);
    addItem(target, 'food', quantity);
    await reply(`🎁 Você doou 🍖 ${quantity} comida(s)!`);
  }
};
