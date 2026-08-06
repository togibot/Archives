export default {
  name: 'menumusica',
  aliases: ['musicamenu'],
  category: 'geral',
  description: 'Menu de música',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🎵 𝙼Ú𝚂𝙸𝙲𝙰 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🎧 *MÚSICA*\n• .play 🔜\n• .pause 🔜\n• .resume 🔜\n• .skip 🔜\n• .stop 🔜\n\n📋 *FILA*\n• .queue 🔜\n• .nowplaying 🔜\n\n🎵 Sistema de música em expansão!`);
  }
};
