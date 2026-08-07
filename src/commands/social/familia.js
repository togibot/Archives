import { ensureUser, getFamily, setFamilyRelation } from '../../database/index.js';

const labels = {
  pai: '👨 Pai',
  mae: '👩 Mãe',
  filho: '🧒 Filho',
  irmao: '🧑 Irmão'
};

const relations = new Set(['pai', 'mae', 'filho', 'irmao']);

function getMentioned(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

function reciprocalRelation(relation) {
  if (relation === 'pai' || relation === 'mae') return 'filho';
  return relation;
}

export default {
  name: 'familia',
  aliases: ['pai', 'mae', 'filho', 'irmao', 'adotar'],
  category: 'social',
  description: 'Sistema de família RP',
  async execute({ message, sender, commandName, reply }) {
    const command = String(commandName || 'familia').toLowerCase();
    const relation = command === 'adotar' ? 'filho' : command;

    if (relations.has(relation)) {
      const target = getMentioned(message)[0];
      if (!target) {
        return reply(`👨‍👩‍👧 Marque alguém para definir ${labels[relation].toLowerCase()}.`);
      }
      if (String(target).split('@')[0] === String(sender).split('@')[0]) {
        return reply('👨‍👩‍👧 Você não pode definir a si mesmo nessa relação.');
      }

      ensureUser(target);
      ensureUser(sender);

      // Registra a relação nos dois sentidos para que ambos consigam consultar
      // a própria família. Pai/mãe ↔ filho e irmão ↔ irmão.
      setFamilyRelation(sender, relation, target);
      setFamilyRelation(target, reciprocalRelation(relation), sender);

      return reply(
        `👨‍👩‍👧 Relação RP registrada!\n${labels[relation]}: @${target.split('@')[0]}`,
        { mentions: [target] }
      );
    }

    const family = getFamily(sender);
    if (!family.length) {
      return reply(
        '👨‍👩‍👧 Sua família RP ainda está vazia.\n\n' +
        'Use *.pai @pessoa*, *.mae @pessoa*, *.filho @pessoa* ou *.irmao @pessoa*.'
      );
    }

    const mentions = [...new Set(family.map(item => item.target_jid))];
    const lines = family.map(item => `${labels[item.relation] || '👤 Relação'}: @${item.target_jid.split('@')[0]}`);

    return reply(
      `╭━━━〔 👨‍👩‍👧 𝐅𝐀𝐌Í𝐋𝐈𝐀 𝐑𝐏 〕━━━╮\n${lines.join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━╯`,
      { mentions }
    );
  }
};
