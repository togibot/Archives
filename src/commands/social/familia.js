import { ensureUser, getFamily, setFamilyRelation } from '../../database/index.js';

const labels = {
  pai: '👨 Pai',
  mae: '👩 Mãe',
  filho: '🧒 Filho',
  irmao: '🧑 Irmão'
};

function getMentioned(message) {
  return message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export default {
  name: 'familia',
  aliases: ['pai', 'mae', 'filho', 'irmao', 'adotar'],
  category: 'social',
  description: 'Sistema de família RP',
  async execute({ message, sender, text, reply }) {
    const command = text.slice(1).trim().split(/\s+/)[0].toLowerCase();
    const relation = command === 'adotar' ? 'filho' : command;

    if (['pai', 'mae', 'filho', 'irmao'].includes(relation)) {
      const target = getMentioned(message)[0];
      if (!target) return reply(`👨‍👩‍👧 Marque alguém para definir ${labels[relation].toLowerCase()}.`);
      if (target === sender) return reply('👨‍👩‍👧 Você não pode definir a si mesmo nessa relação.');
      ensureUser(target);
      setFamilyRelation(sender, relation, target);
      return reply(`👨‍👩‍👧 Relação RP registrada!\n${labels[relation]}: @${target.split('@')[0]}`, { mentions: [target] });
    }

    const family = getFamily(sender);
    if (!family.length) return reply('👨‍👩‍👧 Sua família RP ainda está vazia.\n\nUse *.pai @pessoa*, *.mae @pessoa*, *.filho @pessoa* ou *.irmao @pessoa*.');

    const mentions = family.map(item => item.target_jid);
    const lines = family.map(item => `${labels[item.relation] || '👤 Relação'}: @${item.target_jid.split('@')[0]}`);
    return reply(`╭━━━〔 👨‍👩‍👧 𝐅𝐀𝐌Í𝐋𝐈𝐀 𝐑𝐏 〕━━━╮\n${lines.join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━╯`, { mentions });
  }
};
