export default {
  name: 'menurpg',
  aliases: ['rpgmenu'],
  category: 'geral',
  description: 'Menu de RPG',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🎮 𝚁𝙿𝙶 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n⚔️ *AVENTURA*\n• .rpg\n\n🗺️ *EM BREVE*\n• .explore\n• .quest\n• .battle\n• .boss\n• .arena\n\n🏆 O RPG completo será expandido em breve!`);
  }
};
