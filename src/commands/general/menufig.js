export default {
  name: 'menufig',
  aliases: ['figmenu'],
  category: 'geral',
  description: 'Menu de figurinhas',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🎨 𝙵𝙸𝙶𝚄𝚁𝙸𝙽𝙷𝙰𝚂\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🖼️ *CRIAR*\n• .sticker\n• .brat\n\n✨ *EM BREVE*\n• .toimg\n• .resize\n• .crop\n\n🎨 Mais ferramentas de edição chegando!`);
  }
};
