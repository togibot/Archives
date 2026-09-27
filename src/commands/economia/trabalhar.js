import { jobs } from '../general/vagas.js';
import { addTokens, ensureUser, updateUser } from '../../database/index.js';
import { applyPetReward } from '../../services/pet-abilities.js';
import { getName } from '../../utils/message.js';

const DAY = 24 * 60 * 60 * 1000;
const LIMIT = 3;

function getState(user) {
  const now = Date.now();
  const start = Number(user.work_window_start || 0);
  if (!start || now - start >= DAY) return { windowStart: now, uses: 0 };
  return { windowStart: start, uses: Number(user.work_count || 0) };
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

    const state = getState(user);
    if (state.uses >= LIMIT) {
      return reply(`💼 Você já trabalhou *${LIMIT}/${LIMIT} vezes* hoje.\n⏰ O limite será renovado no próximo ciclo diário.`);
    }

    const basePayment = Math.floor(Math.random() * (job.pay[1] - job.pay[0] + 1)) + job.pay[0];
    const payment = applyPetReward(sender, basePayment);
    state.uses += 1;
    updateUser(sender, { work_count: state.uses, work_window_start: state.windowStart });

    const updatedUser = addTokens(sender, payment);

    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  ${job.emoji} 𝚃𝚁𝙰𝙱𝙰𝙻𝙷𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👤 ${updatedUser.name}\n💼 Profissão: *${job.name}*\n💰 Pagamento: *+${payment} Tokens*\n🪙 Saldo: *${updatedUser.tokens.toLocaleString('pt-BR')} Tokens*\n📊 Trabalhos no ciclo: *${state.uses}/${LIMIT}*\n\n✨ Bom trabalho!`);
  }
};
