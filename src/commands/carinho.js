export default {
  command: 'carinho',
  aliases: [],
  category: 'social',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const actor = m.key.participant || jid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target || target === actor) {
      await sock.sendMessage(jid, { text: '💜 Use *.carinho @pessoa* para enviar uma mensagem de carinho!' }, { quoted: m });
      return;
    }

    const messages = [
      '💜 mandou muito carinho',
      '✨ enviou boas vibrações',
      '🌷 deixou um carinho especial',
      '🫶 mandou um gesto de amizade'
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];

    await sock.sendMessage(jid, {
      text: `@${actor.split('@')[0]} ${message} para @${target.split('@')[0]}! 💜`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
