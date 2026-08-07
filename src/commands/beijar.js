export default {
  command: 'beijar',
  aliases: ['beijo'],
  category: 'social',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const actor = m.key.participant || jid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target || target === actor) {
      await sock.sendMessage(jid, { text: '💋 Use *.beijar @pessoa* para mandar um beijo virtual!' }, { quoted: m });
      return;
    }

    await sock.sendMessage(jid, {
      text: `💋 @${actor.split('@')[0]} mandou um beijo virtual para @${target.split('@')[0]}! 💜`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
