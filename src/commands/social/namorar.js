import { ensureUser, getRelationship, setRelationship } from '../../database/index.js';
import { createDatingRequest } from '../../services/rp.js';

function getMentioned(message) {
  return message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export default {
  name: 'namorar',
  aliases: ['pedido'],
  category: 'social',
  description: 'Envia um pedido de relacionamento RP',
  async execute({ message, sender, reply }) {
    const target = getMentioned(message)[0];
    if (!target) return reply('💞 Marque uma pessoa. Ex.: *.namorar @pessoa*');
    if (target === sender) return reply('💞 Você não pode enviar um pedido para si mesmo.');
    if (getRelationship(sender)) return reply('💞 Você já possui um relacionamento registrado no RP.');
    if (getRelationship(target)) return reply('💞 Essa pessoa já possui um relacionamento registrado no RP.');

    ensureUser(target);
    createDatingRequest(sender, target);
    return reply(`💌 @${sender.split('@')[0]} enviou um pedido de relacionamento RP para @${target.split('@')[0]}!\n\nUse *.aceitar @${sender.split('@')[0]}* para aceitar.`, { mentions: [sender, target] });
  }
};
