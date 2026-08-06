export default {
  command: 'duelo',
  category: 'fun',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target) {
      await sock.sendMessage(jid, {
        text: '⚔️ Use *.duelo @pessoa* para iniciar um duelo de RP!'
      }, { quoted: m });
      return;
    }

    const actor = m.key.participant || m.key.remoteJid;
    const winner = Math.random() < 0.5 ? actor : target;
    const loser = winner === actor ? target : actor;

    await sock.sendMessage(jid, {
      text: `╭━━━〔 ⚔️ 𝐃𝐔𝐄𝐋𝐎 〕━━━╮\n┃ @${actor.split('@')[0]} 🆚 @${target.split('@')[0]}\n┃\n┃ 🏆 Vencedor: @${winner.split('@')[0]}\n┃ 😵 Derrotado no RP: @${loser.split('@')[0]}\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n🎮 Resultado fictício de Battle Mode.`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
