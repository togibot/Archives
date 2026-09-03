import { ensureUser, getTopUsers, getTopActivity, getTopWins, getTopStreak, getQuizRank } from '../database/index.js';

const LIMIT = 10;

function cleanName(name, jid) {
  return String(name || '').trim() || `@${String(jid).split('@')[0]}`;
}

function podium(position) {
  return ['🥇', '🥈', '🥉'][position] || `${position + 1}º`;
}

function formatList(rows, value) {
  if (!rows.length) return '┃   └─ Ainda não há dados suficientes.';
  return rows.map((row, i) => `┃ ${podium(i)} *${cleanName(row.name, row.jid)}* — ${value(row)}`).join('\n');
}

function menu() {
  return `╭━━━〔 🏆💜 RANKINGS V2 〕━━━╮\n┃\n┃ 🪙 .ranks tokens\n┃ 🎮 .ranks ativo\n┃ 🏆 .ranks vitorias\n┃ 🧠 .ranks quiz\n┃ 🔥 .ranks streak\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
}

export default {
  name: 'ranks',
  aliases: ['ranking', 'rankings', 'top'],
  category: 'fun',
  description: 'Mostra os Rankings V2 do Togi.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const type = String(args[0] || '').toLowerCase();

    if (!type) return reply(menu());

    if (['tokens', 'token', 'rico', 'rich'].includes(type)) {
      const rows = getTopUsers(LIMIT);
      return reply(`╭━━━〔 🪙💎 TOP TOKENS 〕━━━╮\n┃\n${formatList(rows, row => `*${row.tokens}* 🪙`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    if (['ativo', 'atividade', 'games', 'jogos'].includes(type)) {
      const rows = getTopActivity(LIMIT);
      return reply(`╭━━━〔 ⚡🎮 TOP ATIVOS 〕━━━╮\n┃\n${formatList(rows, row => `*${row.played}* partidas`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    if (['vitorias', 'wins', 'win'].includes(type)) {
      const rows = getTopWins(LIMIT);
      return reply(`╭━━━〔 🏆🔥 TOP VITÓRIAS 〕━━━╮\n┃\n${formatList(rows, row => `*${row.wins}* vitórias`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    if (['quiz', 'cerebro', 'acertos'].includes(type)) {
      const rows = getQuizRank(LIMIT);
      return reply(`╭━━━〔 🧠📚 TOP QUIZ 〕━━━╮\n┃\n${formatList(rows, row => `*${row.correct}* acertos • ${row.score} pts`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    if (['streak', 'sequencia'].includes(type)) {
      const rows = getTopStreak(LIMIT);
      return reply(`╭━━━〔 🔥⚡ TOP STREAK 〕━━━╮\n┃\n${formatList(rows, row => `melhor: *${row.best_streak}x*`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    return reply(`❌ Ranking *${type}* não encontrado.\n\nUse *.ranks* para ver as opções.`);
  }
};
