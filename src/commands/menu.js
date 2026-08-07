export default {
  name: 'menu',
  aliases: ['m', 'ajuda', 'help', 'inicio'],
  category: 'menu',
  description: 'Menu principal do Togi Bot.',
  async execute({ reply }) {
    return reply(`╭━━━〔 🤖 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 〕━━━╮
┃
┃ 🎮 *DIVERSÃO / ARCADE*
┃ • .arcade — todos os jogos
┃ • .adivinhe • .anagrama • .dado
┃ • .quiz • .duelo
┃
┃ 🎴 *TOGI CARDS*
┃ • .album — seu álbum
┃ • .cards — catálogo
┃ • .carta — carta
┃ • .pack — pacotinho
┃ • .abrirpack — abrir Pack
┃ • .cartadodia — carta do dia
┃ • .batalhacartas — batalha
┃ • .cartasempare — encontrar par
┃
┃ 🏠 *CASA*
┃ • .casa — casa do grupo
┃
┃ 💞 *SOCIAL / RELACIONAMENTO*
┃ • .casal • .ship • .namorar
┃ • .beijar • .abracar • .carinho
┃ • .segurarmao • .encontro
┃
┃ 💤 *STATUS*
┃ • .afk • .afk-off
┃
┃ 🪙 *ECONOMIA*
┃ • .saldo • .daily • .weekly
┃ • .trabalhar • .loja • .comprar
┃ • .pagar • .rank • .perfil
┃
┃ 🐾 *PETS*
┃ • .pet • .petshop • .meuspets
┃ • .petinfo • .petstats
┃
┃ 🤖 *TOGI AI*
┃ • .TogiAi — ativar/desativar conversa
┃
┃ 🛡️ *GRUPOS / MODERAÇÃO*
┃ • .antilink • .antipalavrao
┃ • .kick • comandos de administração
┃
┃ 🎵 *MÚSICA*
┃ • .play <nome da música>
┃
┃ 🎨 *FIGURINHAS*
┃ • .fig • .brat
┃
┃ 💡 Use *.arcade* para abrir a central
┃ completa de minijogos do Togi.
╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
