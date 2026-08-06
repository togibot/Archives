import { getUser, addTokens, getItemQuantity, addItem } from '../../database/index.js';
export default { name:'escudo', aliases:['shield'], category:'economia', description:'Compra um escudo contra roubos', async execute({ sender, reply }) {
  const price=500, user=getUser(sender);
  if (getItemQuantity(sender,'shield') > 0) return reply('🛡️ Você já possui um escudo ativo.');
  if (user.tokens < price) return reply(`❌ Você precisa de ${price} Tokens.`);
  addTokens(sender,-price); addItem(sender,'shield',1);
  return reply('🛡️ *ESCUDO ATIVADO!*\n\nVocê está protegido contra uma tentativa de roubo.');
} };
