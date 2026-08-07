export default {
  command: 'segurarmao',
  aliases: ['maosdadas'],
  category: 'social',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const actor = m.key.participant || jid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target || target === actor) {
      await sock.sendMessage(jid, { text: '🤝 Use *.segurarmao @pessoa* para uma interação virtual!' }, { quoted: m });
      return;
    }

    await sock.sendMessage(jid, {
      text: `🤝 @${actor.split('@')[0]} segurou a mão de @${target.split('@')[0]}! 💜`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
