import { jobs } from '../general/vagas.js';
import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

export default {
  name: 'escolher',
  aliases: ['escolhervaga', 'escolheremprego'],
  category: 'economia',
  description: 'Escolhe uma profissão pelo número da lista de vagas',
  async execute({ text, args, sender, message, reply }) {
    const rawChoice = Array.isArray(args) && args.length ? args[0] : String(text || '').trim().split(/\s+/)[0];
    const index = Number(rawChoice);

    if (!rawChoice || !Number.isInteger(index) || index < 1 || index > jobs.length) {
      return reply(`❌ Vaga inválida.\n\n💼 Use *.vagas* para ver a lista completa.\n📌 Escolha pelo número. Exemplo: *.escolher 1*`);
    }

    const user = ensureUser(sender, getName(message));
    const job = jobs[index - 1];

    if (!job) {
      return reply('❌ Essa vaga não existe. Use *.vagas* para atualizar a lista.');
    }

    if (user.job === job.name) {
      return reply(`💼 Você já trabalha como *${job.emoji} ${job.name}*!\n\nUse *.trabalhar* para trabalhar e receber Tokens.`);
    }

    updateUser(sender, { job: job.name });

    return reply(
      `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n` +
      `┃  💼 𝙽𝙾𝚅𝙰 𝙿𝚁𝙾𝙵𝙸𝚂𝚂𝙰̃𝙾 • 𝚃𝙾𝙶𝙸\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `👤 ${user.name}\n` +
      `${job.emoji} Profissão: *${job.name}*\n` +
      `💰 Pagamento: *${job.pay[0]}–${job.pay[1]} Tokens* por trabalho\n\n` +
      `✅ Você foi contratado!\n\n` +
      `💼 Use *.trabalhar* para começar a trabalhar.\n` +
      `📤 Se quiser sair depois, use *.demissao*.`
    );
  }
};
