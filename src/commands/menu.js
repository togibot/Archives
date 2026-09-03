const MENU = `╭━━━〔 💜🤖 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 𝐕𝟐 〕━━━╮
┃ ✨ *MENU PRINCIPAL*
┃ 🎮 Diversão • 🎴 Cards • 🐾 Pets
┃ 🪙 Economia • 🎨 Figurinhas • 🛡️ ADM
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🎮 *DIVERSÃO / ARCADE*
┃ ⚡ .arcade — central de jogos
┃ 🎯 .adivinhe • .anagrama • .dado
┃ 🧠 .quiz • .duelo • .velocidade
┃ 🧩 .sequencia • .misterio • .alvo
┃ 🧠 .memoria • .streak • .corrida
┃ 🔐 .codigo • 🎭 .personagem

🎴 *TOGI CARDS*
┃ 📚 .album — seu álbum
┃ 🃏 .cards — catálogo
┃ 🎴 .carta — carta
┃ 📦 .pack — pacotinho
┃ 🎁 .abrirpack — abrir Pack
┃ ✨ .cartadodia — carta do dia
┃ ⚔️ .batalhacartas — batalha
┃ 🧩 .cartasempare — encontrar par
┃ 💰 .vendercarta — vender repetida
┃ ♻️ .venderrepetidas — vender todas as repetidas

🏠 *CASA*
┃ 🏡 .casa — casa do grupo

💞 *SOCIAL / RELACIONAMENTO*
┃ 💕 .casal • .ship • .namorar
┃ 🤝 .beijar • .abracar • .carinho
┃ ✋ .segurarmao • .encontro
┃ 🎭 novos comandos de Roleplay

💤 *STATUS*
┃ 💤 .afk • .afk-off

🪙 *ECONOMIA*
┃ 💰 .saldo • .daily • .weekly
┃ 💼 .trabalhar • .loja • .comprar
┃ 💸 .pagar • .rank • .perfil
┃ 🏆 Ranks e recompensas do Arcade

🐾 *PETS*
┃ 🐶 .pet • .petshop • .meuspets
┃ 🐱 .petinfo • .petstats
┃ ✨ Novos pets e mais estatísticas

🤖 *TOGI AI*
┃ 🧠 .TogiAi — ativar/desativar conversa

🛡️ *GRUPOS / MODERAÇÃO*
┃ 🔗 .antilink • 🚫 .antipalavrao
┃ 👢 .kick • 🗑️ .d
┃ ⚙️ ADM V2 e comandos de administração

🎵 *MÚSICA*
┃ 🎧 .play <nome da música> — 🧪 *EM TESTE / BETA*
┃ ⚠️ Sistema de música ainda em desenvolvimento

🎨 *FIGURINHAS*
┃ 🖼️ .s • .sticker • .brat
┃ 🏷️ .take • .nick • .perfilfig
┃ 📦 .packs — packs personalizados
┃ ✨ Nova área de figurinhas V2

🏆 *RANKS*
┃ 🪙 Rank Rico • ⚡ Rank Ativo
┃ 😂 Ranks de zoeira • 🎲 Ranks aleatórios

🧠 *QUIZ V2*
┃ 🌎 Conhecimentos Gerais
┃ 🇧🇷 Brasil • 🎮 Games • 🎬 Filmes
┃ 🔬 Ciência • 🏛️ História • 💻 Tecnologia
┃ ⚽ Esportes • 🎵 Música • ➗ Matemática

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 💜 *TOGI BOT V2* — mais jogos, mais sistemas!
┃ 👑 Criador: *LZ*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

export default {
  name: 'menu',
  aliases: ['m', 'ajuda', 'help', 'inicio'],
  category: 'menu',
  description: 'Mostra o menu principal do Togi.',
  async execute({ reply }) {
    return reply(MENU);
  }
};
