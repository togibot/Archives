import { getAfk, setAfk, clearAfk } from '../services/afk-store.js';

export default {
  name: 'afk',
  aliases: [],
  category: 'social',
  async execute({ sender, reply, text }) {
    const current = getAfk(sender);

    // .afk é um toggle: usar novamente desativa manualmente.
    if (current) {
      clearAfk(sender);
      return reply('👋 Você saiu do AFK!');
    }

    const reason = text?.trim() || 'não informou o motivo';
    setAfk(sender, { reason, since: Date.now() });
    return reply(`╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n┃ 😴 Você entrou em AFK.\n┃ 📝 Motivo: ${reason}\n╰━━━━━━━━━━━━━━━━━━╯`);
  }
};
