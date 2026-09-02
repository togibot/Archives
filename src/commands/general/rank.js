import { getTopXP, getTopUsers, getUser } from '../../database/index.js';

function displayName(user) {
  return user?.name || user?.jid?.split('@')[0] || 'Usuário';
}

function formatRows(rows, value) {
  return rows.map((u, i) => `${i + 1}. ${displayName(u)} — ${value(u)}`).join('\n') || 'Sem jogadores.';
}

export default {
  name: 'rank',
  aliases: ['levelrank'],
  category: 'geral',
  description: 'Ranking V2 de XP e TOKENS',
  async execute({ sender, reply }) {
    const xpRows = getTopXP(5);
    const tokenRows = getTopUsers(5);
    const me = getUser(sender);

    const xpPos = xpRows.findIndex(u => u.jid === sender);
    const tokenPos = tokenRows.findIndex(u => u.jid === sender);

    return reply(`╭═══〔 🏆💜 𝐑𝐀𝐍𝐊 𝐕𝟐 💜🏆 〕═══╮
┃
┃ ⭐ 𝐑𝐀𝐍𝐊 𝐃𝐄 𝐗𝐏
┃ ${formatRows(xpRows, u => `⭐ ${u.xp} XP`)}
┃
┃ 🪙 𝐑𝐀𝐍𝐊 𝐃𝐄 𝐑𝐈𝐐𝐔𝐄𝐙𝐀
┃ ${formatRows(tokenRows, u => `🪙 ${u.tokens} TOKENS`)}
┃
┃ 👤 𝐒𝐄𝐔 𝐏𝐄𝐑𝐅𝐈𝐋
┃ ⭐ Nível: ${me?.level ?? 1}
┃ 🪙 TOKENS: ${me?.tokens ?? 0}
┃ ${xpPos >= 0 ? `📍 XP: #${xpPos + 1}` : '📍 XP: fora do Top 5'}
┃ ${tokenPos >= 0 ? `💰 Riqueza: #${tokenPos + 1}` : '💰 Riqueza: fora do Top 5'}
┃
╰══════════════════════════╯`);
  }
};
