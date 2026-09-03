import { ensureUser } from '../database/index.js';
import { getName } from '../utils/message.js';

export default {
  name: 'perfilfig',
  aliases: ['figperfil'],
  category: 'sticker',
  description: 'Mostra seu perfil de figurinhas.',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    return reply(`╭━━━〔 🎨 𝐏𝐄𝐑𝐅𝐈𝐋 𝐅𝐈𝐆 〕━━━╮\n┃ 👤 ${user.name || 'Usuário'}\n┃ 🏷️ Nick: *${user.sticker_nick?.trim() || '💜✨ 𝐅𝐢𝐠 𝐝𝐨 𝐓𝐨𝐠𝐢 ✨💜'}*\n┃ ✨ Sistema: *Togi Fig V2*\n╰━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
