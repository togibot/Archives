import config from '../../config.js';

export default {
  name: 'menubot',
  aliases: ['botmenu'],
  category: 'geral',
  description: 'Menu do sistema do bot',
  async execute({ reply }) {
    const p = config.bot.prefix;
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚙️ 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 • 𝚃𝙾𝙶𝙸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

⚡ *STATUS*
• ${p}ping

👤 *USUÁRIO*
• ${p}perfil
• ${p}afk
• ${p}rank

ℹ️ *INFORMAÇÕES*
• ${p}menu
• ${p}menubot

👑 *CRÉDITOS*
• Criador: ${config.credits.owner}
• SubDonos: ${config.credits.subOwners.join(' • ')}

🔐 *LICENÇA*
• Projeto proprietário — consulte o arquivo LICENSE.
• Não autorizado para fork, clone, redistribuição ou revenda do código.

🔥 Versão: *${config.bot.version}*
🪙 Moeda: *${config.economy.name}*`);
  }
};
