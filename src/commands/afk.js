export default {
  command: 'afk',
  category: 'social',
  async run(m, { sock, text, prefix, afkStore }) {
    const reason = text?.trim() || 'não informou o motivo';
    const sender = m.key.participant || m.key.remoteJid;
    const now = Date.now();
    afkStore.set(sender, { reason, since: now });
    const elapsed = new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await sock.sendMessage(m.key.remoteJid, {
      text: `╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n┃ 😴 @${sender.split('@')[0]} entrou em AFK.\n┃ 📝 Motivo: ${reason}\n┃ 🕐 Desde: ${elapsed}\n╰━━━━━━━━━━━━━━━━━━╯`,
      mentions: [sender]
    }, { quoted: m });
  }
};
