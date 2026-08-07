import { getAfk, setAfk, clearAfk } from '../services/afk-store.js';

export default {
  name: 'afk',
  aliases: [],
  category: 'social',
  async execute({ sender, reply, text }) {
    const current = getAfk(sender);

    // AFK 1.0: .afk é um toggle. Uma nova mensagem comum também encerra o AFK.
    if (current) {
      clearAfk(sender);
      return reply('👋 Você saiu do AFK!\n\n💡 O comando .afk funciona como toggle: use novamente para desativar.');
    }

    const reason = text?.trim() || 'não informou o motivo';
    setAfk(sender, { reason, since: Date.now() });
    return reply(`╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n┃ 😴 AFK ativado!\n┃ 📝 Motivo: ${reason}\n┃ 💬 Para desativar: envie .afk\n╰━━━━━━━━━━━━━━━━━━╯`);
  }
};
