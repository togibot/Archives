import { clearAfk, getAfk } from '../services/afk-store.js';

export default {
  command: 'afkoff',
  category: 'social',
  async run(m, { sock }) {
    const sender = m.key.participant || m.key.remoteJid;
    const entry = getAfk(sender);
    clearAfk(sender);
    await sock.sendMessage(m.key.remoteJid, {
      text: entry
        ? `╭━━━〔 🟢 𝐀𝐅𝐊 〕━━━╮\n┃ @${sender.split('@')[0]} saiu do modo AFK.\n┃ 👋 Bem-vindo de volta!\n╰━━━━━━━━━━━━━━━━━━╯`
        : `🟢 @${sender.split('@')[0]}, você não estava em AFK.`,
      mentions: [sender]
    }, { quoted: m });
  }
};
