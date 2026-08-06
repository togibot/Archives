import config from '../../config.js';

const line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

export default {
  name: 'menu',
  aliases: ['help', 'ajuda', 'm'],
  category: 'geral',
  description: 'Menu principal do Togi Bot',
  async execute({ reply }) {
    const p = config.bot.prefix;

    return reply(`╭━━━〔 🤖 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 〕━━━╮
┃ ✨ *MENU PRINCIPAL*
┃ Bem-vindo ao centro de comandos!
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

📂 *CATEGORIAS*

🪙 ${p}menueconomia  • Economia
🐾 ${p}menupets      • Pets
🧠 ${p}menuquiz      • Quiz
💞 ${p}menurpg       • RP & Relações
👥 ${p}menugrupo     • Grupos
🛡️ ${p}menuadm       • Administração
🎨 ${p}menufig       • Figurinhas
🎲 ${p}menudiversao  • Diversão
🏆 ${p}menuranking   • Rankings
🎁 ${p}menueventos   • Eventos
🎵 ${p}menumusica   • Música
🤖 ${p}menuia        • Inteligência
👑 ${p}menuvip       • VIP
⚙️ ${p}menubot       • Informações

💼 *ECONOMIA EXTRA*
${p}vagas          • Ver empregos
${p}trabalhar      • Trabalhar
${p}afk            • Ativar AFK

${line}
🪙 Moeda: *Token*
🔥 Togi Bot v${config.bot.version}
👑 Criador: *LZ*
⭐ SubDonos: *Lkz • Unc.*
${line}`);
  }
};
