export default {
  name: 'menumusica',
  aliases: ['musicamenu'],
  category: 'geral',
  description: 'Menu de música',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🎵 𝙼Ú𝚂𝙸𝙲𝙰 • 𝚃𝙾𝙶𝙸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🎧 *SISTEMA DE MÚSICA*
Nenhum comando de reprodução está ativo nesta versão.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 O menu permanece disponível para futuras integrações, sem anunciar comandos que ainda não existem.`);
  }
};
