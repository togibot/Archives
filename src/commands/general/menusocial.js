export default {
  name: 'menusocial',
  aliases: ['socialmenu'],
  category: 'geral',
  description: 'Menu social',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  💞 𝚂𝙾𝙲𝙸𝙰𝙻 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n👤 *PERFIL*\n├ .perfil\n└ .afk\n\n💘 *COMPATIBILIDADE*\n├ .ship @pessoa\n└ .casal — sorteia 2 pessoas do grupo\n\n✨ *DICA*\nUse *.casal* em um grupo para descobrir o próximo casal aleatório!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💜 Diversão, amizade e caos em um só lugar.`);
  }
};
