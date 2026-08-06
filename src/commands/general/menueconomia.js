import config from '../../config.js';

export default {
  name: 'menueconomia',
  aliases: ['economia'],
  category: 'geral',
  description: 'Menu completo de economia e pets',
  async execute({ reply }) {
    const p = config.bot.prefix;
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🪙 𝙴𝙲𝙾𝙽𝙾𝙼𝙸𝙰 • 𝚃𝙾𝙺𝙴𝙽
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💰 *CARTEIRA*
├ ${p}saldo
├ ${p}daily
├ ${p}weekly
├ ${p}pay @pessoa valor
└ ${p}rich

🏪 *COMÉRCIO*
├ ${p}loja
├ ${p}comprar item
└ ${p}inventario

🥷 *RISCO*
├ ${p}roubar @pessoa
└ ${p}escudo

🐾 *PETS*
├ ${p}petshop
├ ${p}comprarpet
├ ${p}meuspets
├ ${p}petinfo
├ ${p}petstats
├ ${p}alimentar
├ ${p}brincar
├ ${p}dormir
├ ${p}curar
├ ${p}doarpet
└ ${p}doarcomida

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪙 Moeda oficial: *${config.economy.name}*`);
  }
};
