import { addTokens, ensureUser, updateUser } from '../../database/index.js';
import { jobs } from '../general/vagas.js';
import { getName } from '../../utils/message.js';
import { applyPetReward } from '../../services/pet-abilities.js';

const DAY = 24 * 60 * 60 * 1000;

function formatRemaining(ms) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return hours + 'h ' + minutes + 'min';
  if (hours) return hours + 'h';
  return minutes + 'min';
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  name: 'horaextra',
  aliases: ['extra', 'extraextra', 'hora-extra'],
  category: 'economia',
  description: 'Faz uma hora extra, uma vez a cada 24 horas.',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    if (!user.job) {
      return reply(
        '💼 Você precisa ter uma profissão antes de fazer hora extra.\n\n' +
        'Use *.vagas* e depois *.escolher <número>* para escolher um emprego.'
      );
    }

    const job = jobs.find(item => item.name === user.job);
    if (!job) {
      return reply('❌ Sua profissão atual não foi encontrada. Use *.vagas* para escolher outra.');
    }

    const now = Date.now();
    const last = Number(user.last_extra_work || 0);
    if (last > 0 && now - last < DAY) {
      return reply(
        '⏰ Você já fez sua hora extra neste ciclo!\n' +
        '⌛ Disponível novamente em aproximadamente *' + formatRemaining(DAY - (now - last)) + '*.'
      );
    }

    const outcomes = [
      { key:'lot', label:'🔥 Trabalhou MUITO!', factorMin:1.70, factorMax:2.20 },
      { key:'normal', label:'💼 Trabalhou normalmente.', factorMin:1.15, factorMax:1.45 },
      { key:'little', label:'😮 Trabalhou pouco, mas ainda rendeu!', factorMin:0.75, factorMax:1.00 }
    ];
    const outcome = outcomes[randomInt(0, outcomes.length - 1)];
    const base = randomInt(job.pay[0], job.pay[1]);
    const factor = outcome.factorMin + Math.random() * (outcome.factorMax - outcome.factorMin);
    const rawReward = Math.max(1, Math.floor(base * factor));
    const rewardResult = applyPetReward(sender, rawReward, 'work');
    const reward = Number(rewardResult?.amount || rawReward);

    updateUser(sender, { last_extra_work: now });
    const updated = addTokens(sender, reward);

    return reply(
      '╭━━━〔 ⏰ 𝐇𝐎𝐑𝐀 𝐄𝐗𝐓𝐑𝐀 〕━━━╮\n' +
      '┃ 👤 ' + (updated.name || 'Usuário') + '\n' +
      '┃ 💼 Profissão: *' + job.name + '*\n' +
      '┃ ' + outcome.label + '\n' +
      '┃ 💰 Recebeu: *+' + reward.toLocaleString('pt-BR') + ' Tokens*\n' +
      '┃ 🪙 Saldo: *' + Number(updated.tokens || 0).toLocaleString('pt-BR') + ' Tokens*\n' +
      '┃ ⏰ Próxima hora extra: *em até 24h*\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
