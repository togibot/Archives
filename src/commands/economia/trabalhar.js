import { jobs } from '../general/vagas.js';

const workState = new Map();
const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 3;

function getState(user) {
  const current = workState.get(user) || { date: 0, uses: 0, job: null };
  if (Date.now() - current.date >= DAY) return { date: Date.now(), uses: 0, job: current.job };
  return current;
}

export default {
  name: 'trabalhar',
  aliases: ['work'],
  category: 'economia',
  description: 'Trabalha em um emprego e recebe Tokens',
  async execute({ text, sender, reply }) {
    const state = getState(sender);
    if (state.uses >= LIMIT) return reply(`💼 Você já trabalhou *${LIMIT}/${LIMIT} vezes* hoje.\n⏰ Volte depois do reset diário.`);

    const choice = text.trim().toLowerCase();
    if (!choice) return reply('💼 Escolha um emprego! Use *.vagas* para ver as opções.\nEx.: *.trabalhar programador*');

    const job = jobs.find((item, index) => item.name.toLowerCase() === choice || String(index + 1) === choice);
    if (!job) return reply('❌ Esse emprego não existe. Use *.vagas* para consultar as vagas.');

    const payment = Math.floor(Math.random() * (job.pay[1] - job.pay[0] + 1)) + job.pay[0];
    state.date = state.date || Date.now();
    state.uses += 1;
    state.job = job.name;
    workState.set(sender, state);

    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  ${job.emoji} 𝚃𝚁𝙰𝙱𝙰𝙻𝙷𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💼 Emprego: *${job.name}*\n💰 Pagamento: *+${payment} Tokens*\n📊 Trabalhos hoje: *${state.uses}/${LIMIT}*\n\n✨ Bom trabalho!`);
  }
};
