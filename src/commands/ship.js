export default {
  command: 'ship',
  aliases: ['compatibilidade'],
  category: 'social',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const actor = m.key.participant || jid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target || target === actor) {
      await sock.sendMessage(jid, { text: '💜 Use *.ship @pessoa* para calcular uma compatibilidade divertida!' }, { quoted: m });
      return;
    }

    const percentage = Math.floor(Math.random() * 101);
    const result = percentage >= 90 ? '💖 Dupla lendária!' : percentage >= 70 ? '💕 Combinação muito boa!' : percentage >= 50 ? '💜 Pode dar uma boa dupla!' : percentage >= 30 ? '✨ Quem sabe?' : '😂 Melhor deixar só na amizade!';

    await sock.sendMessage(jid, {
      text: `╭━━━〔 💜 𝐒𝐇𝐈𝐏 〕━━━╮\n┃ 👤 @${actor.split('@')[0]}\n┃ 💜 +\n┃ 👤 @${target.split('@')[0]}\n┃\n┃ 💘 Compatibilidade: *${percentage}%*\n┃ ${result}\n╰━━━━━━━━━━━━━━━━━━╯`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
