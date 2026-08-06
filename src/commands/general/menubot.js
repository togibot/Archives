import config from '../../config.js';

export default {
  name: 'menubot',
  aliases: ['botmenu'],
  category: 'geral',
  description: 'Menu do sistema do bot',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  ⚙️ 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n⚡ *STATUS*\n• ${config.bot.prefix}ping\n\n👤 *USUÁRIO*\n• ${config.bot.prefix}perfil\n\nℹ️ *INFORMAÇÕES*\n• ${config.bot.prefix}menu\n\n🔥 Versão atual: *${config.bot.version}*\n🪙 Moeda: *Token*`);
  }
};
