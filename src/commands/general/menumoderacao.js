export default {
  name: 'menumoderacao',
  aliases: ['moderacaomenu'],
  category: 'geral',
  description: 'Menu de moderação',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🛡️ 𝙼𝙾𝙳𝙴𝚁𝙰ÇÃ𝙾 • 𝚃𝙾𝙶𝙸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👮 *CONTROLE DO GRUPO*
├ .kick
└ .antilink

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ Estes são os comandos de moderação atualmente ativos.`);
  }
};
