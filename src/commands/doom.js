function getGameUrl() {
  const configured = String(process.env.TOGI_DOOM_URL || '').trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:' || url.username || url.password) return null;

    // The published UZDoom build bundles Freedoom, so players can start
    // without uploading a commercial IWAD.
    url.searchParams.set('iwad', 'freedoom1.wad');
    url.searchParams.set('warp', '1,1');
    url.searchParams.set('nomelt', '1');
    return url.toString();
  } catch {
    return null;
  }
}

export default {
  name: 'doom',
  aliases: [],
  category: 'games',
  description: 'Abre DOOM jogável no navegador, com controles touch.',

  async execute({ args = [], reply }) {
    const action = String(args[0] || '').toLowerCase();

    if (action === 'ajuda' || action === 'help') {
      return reply([
        '╭━━━〔 🎮 TOGI DOOM 〕━━━╮',
        '┃ .doom — abrir o jogo',
        '┃ .doom ajuda — ver esta ajuda',
        '┃',
        '┃ O jogo roda no navegador, com',
        '┃ imagem 3D, áudio e controles touch.',
        '┃ Para encerrar, feche a aba do jogo.',
        '╰━━━━━━━━━━━━━━━━━━━━━━╯'
      ].join('\n'));
    }

    if (action === 'sair' || action === 'stop') {
      return reply('Para encerrar a partida, feche a aba do TOGI DOOM no navegador. O jogo é executado no dispositivo em que foi aberto.');
    }

    const gameUrl = getGameUrl();
    if (!gameUrl) {
      return reply([
        '⚠️ *TOGI DOOM ainda não está configurado.*',
        '',
        'O motor do jogo já foi escolhido, mas falta publicar o servidor HTTPS e definir TOGI_DOOM_URL no .env do Togi.',
        '',
        'Formato esperado:',
        'TOGI_DOOM_URL=https://doom.seudominio.com/',
        '',
        'Consulte docs/DOOM.md para preparar o servidor.'
      ].join('\n'));
    }

    return reply([
      '╭━━━〔 🔥 TOGI DOOM 〕━━━╮',
      '┃ DOOM está pronto para jogar!',
      '┃',
      '┃ 🎮 Jogo: Freedoom (compatível com Doom)',
      '┃ 📱 Controles touch para celular',
      '┃ 🔊 Áudio e renderização 3D no navegador',
      '┃',
      '┃ ▶️ *ABRIR O JOGO:*',
      gameUrl,
      '┃',
      '┃ Para sair, feche a aba do jogo.',
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    ].join('\n'));
  }
};
