import { getRelationship, setRelationship } from '../../database/index.js';
import { consumeDatingRequest } from '../../services/rp.js';

function getMentioned(message) {
  return message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export default {
  name: 'aceitar',
  aliases: ['aceitarnamoro'],
  category: 'social',
  description: 'Aceita um pedido de relacionamento RP',
  async execute({ message, sender, reply }) {
    const requester = getMentioned(message)[0];
    if (!requester) return reply('💞 Marque quem enviou o pedido. Ex.: *.aceitar @pessoa*');
    if (!consumeDatingRequest(sender, requester)) return reply('❌ Não encontrei um pedido válido ou ele expirou.');
    if (getRelationship(sender) || getRelationship(requester)) return reply('💞 Um dos dois já possui um relacionamento registrado.');

    setRelationship(sender, requester);
    return reply(`💞 Pedido aceito!\n\n👤 @${sender.split('@')[0]} + @${requester.split('@')[0]}\n✨ Relacionamento RP registrado com sucesso!`, { mentions: [sender, requester] });
  }
};
