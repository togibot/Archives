import config from '../../config.js';

export default {
  name: 'menurpg',
  aliases: ['rpgmenu'],
  category: 'geral',
  description: 'Menu completo de RPG',
  async execute({ reply }) {
    const p = config.bot.prefix;
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🎮 𝚁𝙿𝙶 • 𝚃𝙾𝙶𝙸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🗺️ *AVENTURA*
├ ${p}rpg
├ ${p}explore
└ ${p}quest

⚔️ *COMBATE FICTÍCIO*
├ ${p}battle
├ ${p}boss
└ ${p}arena

🏆 *RANKING*
└ ${p}rpgrank

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ Evolua seu personagem e divirta-se no RPG!`);
  }
};
