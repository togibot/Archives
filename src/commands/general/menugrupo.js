export default {
  name: 'menugrupo',
  aliases: ['grupomenu'],
  category: 'geral',
  description: 'Menu de grupo',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  👥 𝙶𝚁𝚄𝙿𝙾 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n📋 *INFORMAÇÕES*\n• .groupinfo\n\n👮 *ADMINISTRAÇÃO*\n• .kick\n• .antilink\n\n⚙️ Mais ferramentas de grupo em breve!`);
  }
};
