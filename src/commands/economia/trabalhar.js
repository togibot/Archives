import { jobs } from '../general/vagas.js';
import { addTokens, ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

const workState = new Map();
const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 3;

function getState(user) {
  const current = workState.get(user) || { date: 0, uses: 0 };
  if (Date.now() - current.date >= DAY) return { date: Date.now(), uses: 0 };
  return current;
}

export default {
  name: 'trabalhar',
  aliases: ['work'],
  category: 'economia',
  description: 'Trabalha na profissão escolhida e recebe Tokens',
  async execute({ text, sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    let job = jobs.find(item => item.name === user.job);

    // Compatibilidade com o formato antigo: .trabalhar <emprego>.
    if (!job && text.trim()) {
      const choice = text.trim().toLowerCase();
      job = jobs.find((item, index) => item.name.toLowerCase() === choice || String(index + 1) === choice);
      if (job) updateUser(sender, { job: job.name });
    }

    if (!job) {
      return reply('💼 Você não possui uma profissão.\n\nUse *.vagas* e depois *.escolher <número>* para escolher seu emprego.\nExemplo: *.escolher 1*');
    }

    const state = getState(sender);
    if (state.uses >= LIMIT) {
      return reply(`💼 Você já trabalhou *${LIMIT}/${LIMIT} vezes* hoje.\n⏰ O limite será renovado no próximo ciclo diário.`);
    }

    const payment = Math.floor(Math.random() * (job.pay[1] - job.pay[0] + 1)) + job.pay[0];
    state.date = state.date || Date.now();
    state.uses += 1;
    workState.set(sender, state);

    const updatedUser = addTokens(sender, payment);

    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  ${job.emoji} 𝚃𝚁𝙰𝙱𝙰𝙻𝙷𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👤 ${updatedUser.name}\n💼 Profissão: *${job.name}*\n💰 Pagamento: *+${payment} Tokens*\n🪙 Saldo: *${updatedUser.tokens.toLocaleString('pt-BR')} Tokens*\n📊 Trabalhos hoje: *${state.uses}/${LIMIT}*\n\n✨ Bom trabalho!`);
  }
};
