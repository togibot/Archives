import { ensureUser, getTopUsers, getTopActivity, getTopWins, getTopStreak, getQuizRank, getGroupTopUsers, getGroupTopActivity, getGroupTopWins, getGroupTopStreak, getGroupQuizRank } from '../database/index.js';

const LIMIT=10;
function cleanName(name,jid){return String(name||'').trim()||`@${String(jid).split('@')[0]}`;}
function podium(position){return ['🥇','🥈','🥉'][position]||`${position+1}º`;}
function formatList(rows,value){if(!rows.length)return '┃   └─ Ainda não há dados suficientes.';return rows.map((row,i)=>`┃ ${podium(i)} *${cleanName(row.name,row.jid)}* — ${value(row)}`).join('\n');}
function menu(group){return `╭━━━〔 🏆💜 RANKINGS V2 〕━━━╮\n┃\n┃ ${group?'👥 Rankings deste grupo':'🌎 Rankings globais'}\n┃\n┃ 🪙 .ranks tokens — quem tem mais TOKENS\n┃ 🎮 .ranks ativo — quem mais joga\n┃ 🏆 .ranks vitorias — quem mais vence\n┃ 🧠 .ranks quiz — quem mais acerta\n┃ 🔥 .ranks streak — maiores sequências\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;}

export default {
  name:'ranks', aliases:['ranking','rankings','top'], category:'fun', description:'Mostra os rankings dos membros deste grupo.',
  async execute({sender,message,args,reply,isGroup,chat,sock}){
    ensureUser(sender,message?.pushName||'Usuário'); const type=String(args[0]||'').toLowerCase();
    let members=null;
    if(isGroup){try{const metadata=await sock.groupMetadata(chat);members=[...new Set((metadata?.participants||[]).map(p=>p.id).filter(Boolean))];}catch{}}
    if(!type)return reply(menu(isGroup));
    const scoped=Array.isArray(members)&&members.length>0;
    if(['tokens','token','rico','rich'].includes(type)){const rows=scoped?getGroupTopUsers(members,LIMIT):getTopUsers(LIMIT);return reply(`╭━━━〔 🪙💎 TOP TOKENS 〕━━━╮\n┃\n${formatList(rows,row=>`*${row.tokens}* 🪙`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);}
    if(['ativo','atividade','games','jogos'].includes(type)){const rows=scoped?getGroupTopActivity(members,LIMIT):getTopActivity(LIMIT);return reply(`╭━━━〔 ⚡🎮 TOP ATIVOS 〕━━━╮\n┃\n${formatList(rows,row=>`*${row.played}* partidas`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);}
    if(['vitorias','wins','win'].includes(type)){const rows=scoped?getGroupTopWins(members,LIMIT):getTopWins(LIMIT);return reply(`╭━━━〔 🏆🔥 TOP VITÓRIAS 〕━━━╮\n┃\n${formatList(rows,row=>`*${row.wins}* vitórias`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);}
    if(['quiz','cerebro','acertos'].includes(type)){const rows=scoped?getGroupQuizRank(members,LIMIT):getQuizRank(LIMIT);return reply(`╭━━━〔 🧠📚 TOP QUIZ 〕━━━╮\n┃\n${formatList(rows,row=>`*${row.correct}* acertos • ${row.score} pts`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);}
    if(['streak','sequencia'].includes(type)){const rows=scoped?getGroupTopStreak(members,LIMIT):getTopStreak(LIMIT);return reply(`╭━━━〔 🔥⚡ TOP STREAK 〕━━━╮\n┃\n${formatList(rows,row=>`melhor: *${row.best_streak}x*`)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`);}
    return reply(`❌ Ranking *${type}* não encontrado.\n\nUse *.ranks* para ver as opções.`);
  }
};
