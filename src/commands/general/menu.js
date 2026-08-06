import config from '../../config.js';

const line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
const box = (title, body) => `╭${line}╮\n┃  ${title}\n╰${line}╯\n${body}`;

export default {
  name: 'menu',
  aliases: ['help', 'ajuda', 'm'],
  category: 'geral',
  description: 'Exibe o menu principal do Togi Bot',
  async execute({ reply }) {
    return reply(box(`🤖 •𝚃𝚘𝚐𝚒 𝚋𝚘𝚝•`, `\n✨ *MENU PRINCIPAL*\n\n🪙 ${config.bot.prefix}menueconomia\n🐾 ${config.bot.prefix}menupets\n🧠 ${config.bot.prefix}menuquiz\n🎮 ${config.bot.prefix}menurpg\n💞 ${config.bot.prefix}menusocial\n👥 ${config.bot.prefix}menugrupo\n🛡️ ${config.bot.prefix}menumoderacao\n🎨 ${config.bot.prefix}menufig\n🎲 ${config.bot.prefix}menudiversao\n🏆 ${config.bot.prefix}menuranking\n🎁 ${config.bot.prefix}menueventos\n🎵 ${config.bot.prefix}menumusica\n🤖 ${config.bot.prefix}menuia\n👑 ${config.bot.prefix}menuvip\n\n⚙️ ${config.bot.prefix}menubot\n\n${line}\n🪙 Moeda oficial: *Token*\n🔥 Togi Bot v${config.bot.version}`));
  }
};
