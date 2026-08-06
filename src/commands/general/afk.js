import { setAfk, getAfk, clearAfk } from '../../services/afk-store.js';

function formatDuration(since) {
  const elapsed = Math.max(0, Date.now() - since);
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}min` : `${hours}h`;
}

export default {
  name: 'afk',
  aliases: ['ausente'],
  category: 'geral',
  description: 'Ativa ou remove seu status AFK',
  async execute({ sender, args, reply }) {
    const current = getAfk(sender);

    // .afk é um toggle: sem argumento ativa; usando novamente desativa.
    if (current) {
      clearAfk(sender);
      return reply(
        `👋 AFK desativado!\n` +
        `⏱️ Você ficou ausente por *${formatDuration(current.since)}*.`
      );
    }

    const reason = args.join(' ').trim().slice(0, 120) || 'Sem motivo informado';
    setAfk(sender, { reason, since: Date.now() });

    return reply(
      `╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n` +
      `┃ 😴 AFK ativado!\n` +
      `┃ 📝 Motivo: ${reason}\n` +
      `┃ 💬 Qualquer mensagem sua desativa automaticamente.\n` +
      `╰━━━━━━━━━━━━━━━━━━╯`
    );
  }
};
