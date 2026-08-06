import config from '../../config.js';

export default {
  name: 'menurpg',
  aliases: ['rpgmenu', 'menurp', 'menurelacionamentos'],
  category: 'geral',
  description: 'Menu de Roleplay e relações sociais',
  async execute({ reply }) {
    const p = config.bot.prefix;

    return reply(`╭━━━〔 💞 𝐑𝐏 • 𝐓𝐎𝐆𝐈 〕━━━╮
┃ ✨ *ROLEPLAY & RELAÇÕES*
┃ Sistema social do Togi Bot
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

💘 *RELACIONAMENTOS*
• ${p}casal  • Sorteia um casal
• ${p}ship @pessoa  • Compatibilidade
• ${p}namorar @pessoa  • Enviar pedido
• ${p}aceitar @pessoa  • Aceitar pedido
• ${p}terminar  • Encerrar relacionamento

👨‍👩‍👧 *FAMÍLIA RP*
• ${p}familia  • Ver sua família
• ${p}pai @pessoa  • Definir pai
• ${p}mae @pessoa  • Definir mãe
• ${p}filho @pessoa  • Definir filho
• ${p}irmao @pessoa  • Definir irmão
• ${p}adotar @pessoa  • Adotar no RP

🤝 *SOCIAL*
• ${p}amizade @pessoa  • Registrar amizade
• ${p}perfil  • Ver perfil social

${'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}
💞 *Tudo aqui é um sistema social fictício para diversão.*`);
  }
};
