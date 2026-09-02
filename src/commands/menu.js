export default {
  name: 'menu',
  aliases: ['m', 'ajuda', 'help', 'inicio'],
  category: 'menu',
  description: 'Menu principal do Togi Bot.',
  async execute({ reply, sender, isGroup, sock, chat }) {
    const user = `@${String(sender || '').split('@')[0]}`;
    let groupName = 'Conversa privada';
    if (isGroup && sock && chat) {
      try {
        const metadata = await sock.groupMetadata(chat);
        if (metadata?.subject) groupName = metadata.subject;
      } catch {}
    }

    return reply(`╭═══〔 ✦ 💜✨ 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 ✨💜 ✦ 〕═══╮
┃
┃ 💜✨ Oiee ${user}! 👋😎
┃ 🤖 Sou o Togi, seu companheiro de grupo! 🫶💫
┃ 👥 Grupo: ${groupName}
┃ 📩 Caso tenha dúvidas de algo, chame o Dono! 👑
┃
┃ ╭━━〔 🎮🔥 𝐃𝐈𝐕𝐄𝐑𝐒ÃO / 𝐀𝐑𝐂𝐀𝐃𝐄 🕹️〕━━╮
┃ • 🎮 .arcade — todos os jogos 🎯
┃ • 🧠 .adivinhe • 🔤 .anagrama • 🎲 .dado
┃ • ❓ .quiz • ⚔️ .duelo
┃ • ⚡ .velocidade • 🧩 .sequencia • 🕵️ .misterio
┃ • 🎯 .alvo • 🧠 .memoria • 🔥 .streak
┃ • 🏃 .corrida • 🔐 .codigo • 🎭 .personagem
┃ ╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🎴✨ 𝐓𝐎𝐆𝐈 𝐂𝐀𝐑𝐃𝐒 🃏💜 〕━━╮
┃ • 📚 .album — seu álbum
┃ • 🃏 .cards — catálogo
┃ • 🎴 .carta — carta
┃ • 📦 .pack — pacotinho
┃ • 🎁 .abrirpack — abrir Pack
┃ • 🌟 .cartadodia — carta do dia
┃ • ⚔️ .batalhacartas — batalha
┃ • 🔎 .cartasempare — encontrar par
┃ • 💰 .venderrepetidas — vender repetidas
┃ ╰━━━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🏠💜 𝐂𝐀𝐒𝐀 🏡✨ 〕━━╮
┃ • 🏡 .casa — casa do grupo
┃ ╰━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 💞💕 𝐒𝐎𝐂𝐈𝐀𝐋 / 𝐑𝐄𝐋𝐀𝐂𝐈𝐎𝐍𝐀𝐌𝐄𝐍𝐓𝐎 💘🌹 〕━━╮
┃ • 💑 .casal • 💘 .ship • 💌 .namorar
┃ • 😘 .beijar • 🫂 .abracar • 💖 .carinho
┃ • 🤝 .segurarmao • 🌹 .encontro
┃ • 🎭 Novos comandos de Roleplay V2
┃ ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 💤🌙 𝐒𝐓𝐀𝐓𝐔𝐒 ✨ 〕━━╮
┃ • 😴 .afk • 🟢 .afk-off
┃ ╰━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🪙💰 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀 📈💎 〕━━╮
┃ • 💰 .saldo • 🎁 .daily • 📅 .weekly
┃ • 💼 .trabalhar • 🛒 .loja • 🛍️ .comprar
┃ • 💸 .pagar • 🏆 .rank • 👤 .perfil
┃ ╰━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🐾🐶 𝐏𝐄𝐓𝐒 🐱🐾 〕━━╮
┃ • 🐾 .pet • 🏪 .petshop • 🐕 .meuspets
┃ • 📋 .petinfo • 📊 .petstats
┃ ╰━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 ✨🤖 𝐓𝐎𝐆𝐈 𝐀𝐈 🧠💜 〕━━╮
┃ • 💬 .TogiAi — ativar/desativar conversa
┃ ╰━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🛡️🔒 𝐆𝐑𝐔𝐏𝐎𝐒 / 𝐌𝐎𝐃𝐄𝐑𝐀ÇÃ𝐎 🚨👮 〕━━╮
┃ • 🔗 .antilink • 🤬 .antipalavrao
┃ • 👢 .kick • 🗑️ .d
┃ • 👮 Menu de ADM V2 e comandos administrativos
┃ ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🎵🎧 𝐌Ú𝐒𝐈𝐂𝐀 🎶💜 〕━━╮
┃ • 🎶 .play <nome da música> — 🧪 EM TESTE
┃ • ⚠️ Sistema de música ainda em desenvolvimento
┃ ╰━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🎨✨ 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 🖼️💜 〕━━╮
┃ • 🎨 .fig • 🖼️ .brat
┃ • ✂️ .s • 🧩 .sticker
┃ • ✨ .take • 📝 .nick
┃ • 👤 .perfilfig • 📦 .packs
┃ ╰━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 🏆💜 𝐑𝐀𝐍𝐊𝐒 ✨ 〕━━╮
┃ • 🪙 Rank Rico • ⚡ Rank Ativo
┃ • 😂 Ranks de zoeira • 🎲 Ranks aleatórios
┃ ╰━━━━━━━━━━━━━━━━━━━━╯
┃
┃ ╭━━〔 💡💜 𝐃𝐈𝐂𝐀 𝐃𝐎 𝐓𝐎𝐆𝐈 🤖✨ 〕━━╮
┃ • 🎮 Use .arcade para abrir a central
┃   completa de minijogos do Togi! 🕹️🔥
┃ ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃       ✦ 💜 ✨ 🪻 ✨ 💜 ✦
┃       🤖 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 • 𝐕𝟐 👑
┃             💜 𝐋𝐙 💜
╰══════════════════════════════════╯`, { mentions: [sender] });
  }
};
