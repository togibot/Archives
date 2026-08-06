import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

export default {
  name: 'demissao',
  aliases: ['demitir', 'sairdoemprego', 'sairtrabalho'],
  category: 'economia',
  description: 'Sai da profissão atual',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));

    if (!user.job) {
      return reply('❌ Você não possui uma profissão no momento.\n\n💼 Use *.vagas* para escolher uma.');
    }

    const oldJob = user.job;
    updateUser(sender, { job: null });

    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  📤 𝙳𝙴𝙼𝙸𝚂𝚂𝙰̃𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💼 Você saiu do emprego de *${oldJob}*.\n\n✅ Demissão concluída.\n📋 Agora você está sem profissão.\n\n💡 Use *.vagas* e depois *.escolher <número>* para escolher outro emprego.`);
  }
};
