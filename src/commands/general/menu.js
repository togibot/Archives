import config from '../../config.js';

export default {
  name: 'menu',
  aliases: ['help', 'ajuda', 'm'],
  category: 'geral',
  description: 'Exibe o menu principal',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━╮\n┃      🤖 *${config.bot.name}*      ┃\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n💠 *ECONOMIA — TOKEN*\n• ${config.bot.prefix}saldo\n• ${config.bot.prefix}daily\n• ${config.bot.prefix}pay\n• ${config.bot.prefix}loja\n• ${config.bot.prefix}comprar\n• ${config.bot.prefix}inventario\n• ${config.bot.prefix}roubar\n\n🐾 *PETS*\n• ${config.bot.prefix}petshop\n• ${config.bot.prefix}comprarpet\n• ${config.bot.prefix}meuspets\n• ${config.bot.prefix}alimentar\n• ${config.bot.prefix}doarpet\n• ${config.bot.prefix}doarcomida\n\n🧠 *QUIZ*\n• ${config.bot.prefix}quiz\n\n🎮 *RPG*\n• ${config.bot.prefix}rpg\n\n❤️ *SOCIAL*\n• ${config.bot.prefix}ship\n\n👥 *GRUPO*\n• ${config.bot.prefix}groupinfo\n• ${config.bot.prefix}kick\n• ${config.bot.prefix}antilink\n\n🎨 *FIGURINHAS*\n• ${config.bot.prefix}sticker\n• ${config.bot.prefix}brat\n\n⚙️ *SISTEMA*\n• ${config.bot.prefix}ping\n• ${config.bot.prefix}perfil\n\n🪙 Moeda oficial: *Token*\n🔥 Togi Bot v${config.bot.version}`);
  }
};
