import { jobs } from '../general/vagas.js';
import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

export default {
  name: 'escolher',
  aliases: ['escolhervaga', 'escolheremprego'],
  category: 'economia',
  description: 'Escolhe uma profissão pelo número da lista de vagas',
  async execute({ text, sender, message, reply }) {
    const choice = text.trim();
    const index = Number(choice);

    if (!choice || !Number.isInteger(index) || index < 1 || index > jobs.length) {
      return reply(`❌ Escolha uma vaga válida pelo número.\n\n💼 Use *.vagas* para ver a lista completa.\n📌 Exemplo: *.escolher 1*`);
    }

    const user = ensureUser(sender, getName(message));
    const job = jobs[index - 1];

    if (user.job === job.name) {
      return reply(`💼 Você já trabalha como *${job.emoji} ${job.name}*!\n\nUse *.trabalhar* para trabalhar e receber Tokens.`);
    }

    updateUser(sender, { job: job.name });

    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  💼 𝙽𝙾𝚅𝙰 𝙿𝚁𝙾𝙵𝙸𝚂𝚂𝙰̃𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👤 ${user.name}\n${job.emoji} Profissão: *${job.name}*\n💰 Pagamento: *${job.pay[0]}–${job.pay[1]} Tokens* por trabalho\n\n✅ Você foi contratado!\n\n💼 Use *.trabalhar* para começar a trabalhar.\n📤 Se quiser sair depois, use *.demissao*.`);
  }
};
