import { ensureUser, getUser, getGameStats, getQuizStats } from '../database/index.js';

function mention(jid) {
  return `@${String(jid).split('@')[0]}`;
}

function rankInfo(user, games, quiz) {
  const tokens = Number(user?.tokens || 0);
  const played = Number(games?.played || 0);
  const wins = Number(games?.wins || 0);
  const correct = Number(quiz?.correct || 0);
  const bestStreak = Number(quiz?.best_streak || 0);

  if (tokens >= 10000) return ['💰 RANK MAGNATA', 'O cofre do Togi já não aguenta mais.'];
  if (tokens >= 5000) return ['💎 RANK RICO', 'TOKENS pra dar e vender.'];
  if (played >= 100) return ['⚡ RANK VICIADO', 'O Arcade já virou residência.'];
  if (played >= 50) return ['🎮 RANK ATIVO', 'Você não sabe o que é parar de jogar.'];
  if (bestStreak >= 15) return ['🔥 RANK STREAKER', 'Uma sequência absurda de acertos.'];
  if (correct >= 50) return ['🧠 RANK CÉREBRO DO TOGI', 'O Quiz está com medo de você.'];
  if (wins >= 25) return ['🏆 RANK CAMPEÃO', 'Vitórias acumulando sem dó.'];
  const jokes = [
    ['💜 RANK TOGI FRIEND', 'Presença confirmada no universo Togi.'],
    ['🎲 RANK DO NADA', 'Hoje pode acontecer qualquer coisa.'],
    ['✨ RANK LENDÁRIO EM TREINAMENTO', 'O potencial está carregando...'],
    ['🕹️ RANK PLAYER', 'Mais uma partida? Sempre mais uma.']
  ];
  return jokes[(played + correct + tokens) % jokes.length];
}

export default {
  name: 'rank',
  aliases: ['meurank', 'meuranks'],
  category: 'fun',
  description: 'Mostra seu Rank V2 e estatísticas.',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, message?.pushName || 'Usuário');
    const games = getGameStats(sender);
    const quiz = getQuizStats(sender);
    const [rank, phrase] = rankInfo(user, games, quiz);
    const played = Number(games?.played || 0);
    const wins = Number(games?.wins || 0);
    const correct = Number(quiz?.correct || 0);
    const wrong = Number(quiz?.wrong || 0);
    const bestStreak = Number(quiz?.best_streak || 0);

    return reply(`╭━━━〔 🏅💜 SEU RANK V2 〕━━━╮\n┃\n┃ 👤 ${mention(sender)}\n┃ 🏷️ *${rank}*\n┃ 💬 ${phrase}\n┃\n┃ 🪙 Tokens: *${user.tokens}*\n┃ 🎮 Partidas: *${played}*\n┃ 🏆 Vitórias: *${wins}*\n┃ 🧠 Acertos no Quiz: *${correct}*\n┃ ❌ Erros no Quiz: *${wrong}*\n┃ 🔥 Melhor streak: *${bestStreak}x*\n┃ ⭐ XP: *${user.xp}*\n┃ 📈 Nível: *${user.level}*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
