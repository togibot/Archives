import { getTopUsers } from '../../database/index.js';
export default { name:'rich', aliases:['toprich','ricos'], category:'economia', description:'Ranking de Tokens', async execute({ reply }) {
  const rows=getTopUsers(10); const body=rows.map((u,i)=>`${i+1}. ${u.name || u.jid.split('@')[0]} — 🪙 ${u.tokens}`).join('\n') || 'Ainda não há jogadores.';
  return reply(`╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🏆 𝚃𝙾𝙿 𝚃𝙾𝙺𝙴𝙽𝚂\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${body}`);
} };
