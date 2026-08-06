export default {
  name: 'menumoderacao',
  aliases: ['moderacaomenu'],
  category: 'geral',
  description: 'Menu de moderação',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🛡️ 𝙼𝙾𝙳𝙴𝚁𝙰ÇÃ𝙾\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👮 *GRUPOS*\n• .kick\n• .antilink\n\n🔜 *EM BREVE*\n• .warn\n• .warnings\n• .mute\n• .ban\n• .antispam\n• .antiflood`);
  }
};
