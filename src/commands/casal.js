export default {
  command: 'casal',
  category: 'social',
  async run(m, { sock, groupMetadata }) {
    const jid = m.key.remoteJid;
    const participants = (groupMetadata?.participants || []).map(p => p.id).filter(Boolean);
    const pool = participants.filter(id => id !== 'status@broadcast');
    if (pool.length < 2) {
      await sock.sendMessage(jid, { text: '💞 Preciso de pelo menos 2 pessoas no grupo para fazer o casal!' }, { quoted: m });
      return;
    }
    const first = pool[Math.floor(Math.random() * pool.length)];
    let second = pool[Math.floor(Math.random() * pool.length)];
    while (second === first && pool.length > 1) second = pool[Math.floor(Math.random() * pool.length)];
    const percentage = Math.floor(Math.random() * 101);
    const hearts = percentage >= 80 ? '💖💖💖' : percentage >= 50 ? '💕💕' : '💔';
    await sock.sendMessage(jid, {
      text: `╭━━━〔 💞 𝐂𝐀𝐒𝐀𝐋 〕━━━╮\n┃ 👤 @${first.split('@')[0]}\n┃ 💘 +\n┃ 👤 @${second.split('@')[0]}\n┃\n┃ 💗 Compatibilidade: *${percentage}%*\n┃ ${hearts}\n╰━━━━━━━━━━━━━━━━━━╯`,
      mentions: [first, second]
    }, { quoted: m });
  }
};
