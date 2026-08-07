export default {
  command: 'abracar',
  aliases: ['abraco'],
  category: 'social',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const actor = m.key.participant || jid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target || target === actor) {
      await sock.sendMessage(jid, { text: '🤗 Use *.abracar @pessoa* para mandar um abraço virtual!' }, { quoted: m });
      return;
    }

    await sock.sendMessage(jid, {
      text: `🤗 @${actor.split('@')[0]} deu um abraço virtual em @${target.split('@')[0]}! 💜`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
