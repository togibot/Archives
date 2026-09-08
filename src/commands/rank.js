import { ensureUser, getGameStats, getQuizStats, getUserRanks } from '../database/index.js';

function mention(jid) { return `@${String(jid).split('@')[0]}`; }

const JOKE_RANKS = [
  ['🏳️‍🌈 RANK GAY', 'O arco-íris chegou no ranking.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Rainbow_Flag,_GLBT_Pride.jpg'],
  ['👠 RANK SAPATO', 'O salto entrou para o ranking.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Red_high-heeled_shoe_on_display_at_Xin%27ao_Rainbow_(20210217191814).jpg'],
  ['🍕 RANK GOSTOSO', 'Esse aqui merece um lanche.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pizza_image.jpg'],
  ['🍕 RANK GOSTOSA', 'Esse aqui também merece um lanche.', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pizza_food.jpg'],
  ['💜 RANK TOGI FRIEND', 'Presença confirmada no universo Togi.'],
  ['🎲 RANK DO NADA', 'Hoje pode acontecer qualquer coisa.'],
  ['✨ RANK LENDÁRIO EM TREINAMENTO', 'O potencial está carregando...'],
  ['🕹️ RANK PLAYER', 'Mais uma partida? Sempre mais uma.']
];

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

  return JOKE_RANKS[(played + correct + tokens) % JOKE_RANKS.length];
}

export default {
  name: 'rank',
  aliases: ['meurank', 'meuranks'],
  category: 'fun',
  description: 'Mostra seu Rank e sua posição entre os membros do grupo.',

  async execute({ sender, message, chat, isGroup, reply, sock }) {
    const user = ensureUser(sender, message?.pushName || 'Usuário');
    const games = getGameStats(sender);
    const quiz = getQuizStats(sender);

    let memberJids = null;
    if (isGroup) {
      try {
        const metadata = await sock.groupMetadata(chat);
        memberJids = (metadata?.participants || []).map(p => p.id).filter(Boolean);
        memberJids = [...new Set([...memberJids, sender])];
      } catch {}
    }

    const ranks = getUserRanks(sender, memberJids);
    const [rank, phrase, imageUrl] = rankInfo(user, games, quiz);
    const text = `╭━━━〔 🏅💜 SEU RANK V2 〕━━━╮
┃
┃ 👤 ${mention(sender)}
┃ 🏷️ *${rank}*
┃ 💬 ${phrase}
┃
┃ ${isGroup ? '👥 RANKING DO GRUPO' : '🌎 RANKING GLOBAL'}
┃ 🪙 Tokens: *#${ranks?.tokenRank || '-'}*
┃ ⭐ XP: *#${ranks?.xpRank || '-'}*
┃ 🎮 Atividade: *#${ranks?.activityRank || '-'}*
┃ 🏆 Vitórias: *#${ranks?.winsRank || '-'}*
┃ 🔥 Streak: *#${ranks?.streakRank || '-'}*
┃
┃ 🪙 Saldo: *${Number(user.tokens || 0)}*
┃ 🎮 Partidas: *${Number(games?.played || 0)}*
┃ 🏆 Vitórias: *${Number(games?.wins || 0)}*
┃ 🧠 Acertos no Quiz: *${Number(quiz?.correct || 0)}*
┃ ❌ Erros no Quiz: *${Number(quiz?.wrong || 0)}*
┃ 🔥 Melhor streak: *${Number(quiz?.best_streak || 0)}x*
┃ 📈 Nível: *${user.level}*
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;

    if (imageUrl) {
      try {
        return await sock.sendMessage(
          chat,
          { image: { url: imageUrl }, caption: text, mentions: [sender] },
          message.key.fromMe ? undefined : { quoted: message }
        );
      } catch {
        return reply(text, { mentions: [sender] });
      }
    }

    return reply(text, { mentions: [sender] });
  }
};
