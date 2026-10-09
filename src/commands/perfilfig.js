import { ensureUser } from '../database/index.js';
import { getName } from '../utils/message.js';
import { getActivePack } from '../services/sticker-packs.js';

export default {
  name: 'perfilfig',
  aliases: ['figperfil'],
  category: 'sticker',
  description: 'Mostra seu perfil de figurinhas.',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    const active = getActivePack(sender);
    return reply(`╭━━━〔 🎨 PERFIL FIG 〕━━━╮
┃ 👤 ${user.name || 'Usuário'}
┃ 🏷️ Nick: *${user.sticker_nick?.trim() || '💜✨ 𝐅𝐢𝐠 𝐝𝐨 𝐓𝐨𝐠𝐢 ✨💜'}*
┃ 📦 Pack ativo: *${active?.name || 'nenhum'}*
┃ 🎨 FIGs no pack: *${active?.count || 0}*
┃ ✨ Sistema: *Togi Fig V3*
╰━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
