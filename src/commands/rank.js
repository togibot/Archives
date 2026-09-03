import { ensureUser, getUser, getGameStats, getQuizStats, getUserRanks } from '../database/index.js';

function mention(jid) { return `@${String(jid).split('@')[0]}`; }
function rankInfo(user, games, quiz) {
  const tokens=Number(user?.tokens||0), played=Number(games?.played||0), wins=Number(games?.wins||0), correct=Number(quiz?.correct||0), bestStreak=Number(quiz?.best_streak||0);
  if(tokens>=10000)return ['💰 RANK MAGNATA','O cofre do Togi já não aguenta mais.'];
  if(tokens>=5000)return ['💎 RANK RICO','TOKENS pra dar e vender.'];
  if(played>=100)return ['⚡ RANK VICIADO','O Arcade já virou residência.'];
  if(played>=50)return ['🎮 RANK ATIVO','Você não sabe o que é parar de jogar.'];
  if(bestStreak>=15)return ['🔥 RANK STREAKER','Uma sequência absurda de acertos.'];
  if(correct>=50)return ['🧠 RANK CÉREBRO DO TOGI','O Quiz está com medo de você.'];
  if(wins>=25)return ['🏆 RANK CAMPEÃO','Vitórias acumulando sem dó.'];
  const jokes=[['💜 RANK TOGI FRIEND','Presença confirmada no universo Togi.'],['🎲 RANK DO NADA','Hoje pode acontecer qualquer coisa.'],['✨ RANK LENDÁRIO EM TREINAMENTO','O potencial está carregando...'],['🕹️ RANK PLAYER','Mais uma partida? Sempre mais uma.']];
  return jokes[(played+correct+tokens)%jokes.length];
}

export default {
  name:'rank', aliases:['meurank','meuranks'], category:'fun', description:'Mostra seu Rank e sua posição entre os membros do grupo.',
  async execute({ sender, message, chat, isGroup, reply, sock }) {
    const user=ensureUser(sender,message?.pushName||'Usuário'); const games=getGameStats(sender); const quiz=getQuizStats(sender);
    let memberJids=null;
    if(isGroup){ try { const metadata=await sock.groupMetadata(chat); memberJids=(metadata?.participants||[]).map(p=>p.id).filter(Boolean); memberJids=[...new Set([...memberJids,sender])]; } catch {} }
    const ranks=getUserRanks(sender,memberJids); const [rank,phrase]=rankInfo(user,games,quiz);
    return reply(`╭━━━〔 🏅💜 SEU RANK V2 〕━━━╮\n┃\n┃ 👤 ${mention(sender)}\n┃ 🏷️ *${rank}*\n┃ 💬 ${phrase}\n┃\n┃ ${isGroup?'👥 RANKING DO GRUPO':'🌎 RANKING GLOBAL'}\n┃ 🪙 Tokens: *#${ranks?.tokenRank||'-'}*\n┃ ⭐ XP: *#${ranks?.xpRank||'-'}*\n┃ 🎮 Atividade: *#${ranks?.activityRank||'-'}*\n┃ 🏆 Vitórias: *#${ranks?.winsRank||'-'}*\n┃ 🔥 Streak: *#${ranks?.streakRank||'-'}*\n┃\n┃ 🪙 Saldo: *${user.tokens}*\n┃ 🎮 Partidas: *${Number(games?.played||0)}*\n┃ 🏆 Vitórias: *${Number(games?.wins||0)}*\n┃ 🧠 Acertos no Quiz: *${Number(quiz?.correct||0)}*\n┃ ❌ Erros no Quiz: *${Number(quiz?.wrong||0)}*\n┃ 🔥 Melhor streak: *${Number(quiz?.best_streak||0)}x*\n┃ 📈 Nível: *${user.level}*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
