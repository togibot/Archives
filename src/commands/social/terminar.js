import { getRelationship, removeRelationship } from '../../database/index.js';

export default {
  name: 'terminar',
  aliases: ['terminarrelacao', 'divorcio'],
  category: 'social',
  description: 'Remove o relacionamento RP atual',
  async execute({ sender, reply }) {
    const relationship = getRelationship(sender);
    if (!relationship) return reply('💞 Você não possui um relacionamento RP registrado.');

    const partner = relationship.user_a === sender ? relationship.user_b : relationship.user_a;
    removeRelationship(sender);
    return reply(`💭 O relacionamento RP entre @${sender.split('@')[0]} e @${partner.split('@')[0]} foi encerrado.`, { mentions: [sender, partner] });
  }
};
