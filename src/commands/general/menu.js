import config from '../../config.js';

export default {
  name: 'menu',
  aliases: ['help', 'ajuda', 'm'],
  category: 'geral',
  description: 'Exibe o menu principal',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━╮\n┃   🤖 *${config.bot.name}*   ┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n🧩 *GERAL*\n• ${config.bot.prefix}menu\n• ${config.bot.prefix}ping\n• ${config.bot.prefix}perfil\n\n💠 *ECONOMIA*\n• ${config.bot.prefix}saldo\n• ${config.bot.prefix}daily\n• ${config.bot.prefix}pay\n\n🎮 *RPG*\n• ${config.bot.prefix}rpg\n\n❤️ *SOCIAL*\n• ${config.bot.prefix}ship\n\n👥 *GRUPO*\n• ${config.bot.prefix}groupinfo\n\n🎨 *FIGURINHAS*\n• ${config.bot.prefix}sticker\n\n⚙️ *Sistema modular em desenvolvimento*\n🪙 Moeda: *Token*`);
  }
};
