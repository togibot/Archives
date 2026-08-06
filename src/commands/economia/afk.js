const afkUsers = new Map();

export const getAfk = user => afkUsers.get(user);
export const clearAfk = user => afkUsers.delete(user);
export const hasAfk = user => afkUsers.has(user);

function formatDuration(since) {
  const elapsed = Math.max(0, Date.now() - since);
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

export default {
  name: 'afk',
  aliases: ['ausente'],
  category: 'social',
  description: 'Ativa ou desativa o modo AFK',
  async execute({ sender, text, reply }) {
    const value = text.trim();

    if (/^(off|sair|voltar|desativar)$/i.test(value)) {
      const entry = getAfk(sender);
      if (!entry) {
        return reply('🟢 Você não está em AFK.');
      }

      clearAfk(sender);
      return reply(
        `╭━━━〔 🟢 𝐀𝐅𝐊 〕━━━╮\n` +
        `┃ 👋 Você saiu do AFK!\n` +
        `┃ ⏱️ Tempo ausente: ${formatDuration(entry.since)}\n` +
        `╰━━━━━━━━━━━━━━━━━━╯`
      );
    }

    const reason = value || 'sem motivo informado';
    const now = Date.now();

    afkUsers.set(sender, {
      reason,
      since: now
    });

    return reply(
      `╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n` +
      `┃ 😴 AFK ativado!\n` +
      `┃ 📝 Motivo: ${reason}\n` +
      `┃ 💡 Você sairá do AFK automaticamente\n` +
      `┃ assim que enviar qualquer mensagem.\n` +
      `╰━━━━━━━━━━━━━━━━━━╯`
    );
  }
};
