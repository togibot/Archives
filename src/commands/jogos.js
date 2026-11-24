import { getTogiGamesBaseUrl, getTogiGamesCatalog } from '../services/togi-games.js';

export default {
  name: 'jogos',
  aliases: ['games', 'minigames'],
  category: 'games',
  description: 'Mostra o catálogo do Togi Games.',
  async execute({ reply }) {
    const title = process.env.TOGI_GAMES_NAME || 'Togi Games';
    const baseConfigured = Boolean(getTogiGamesBaseUrl());
    const games = getTogiGamesCatalog();
    const external = games.map((game) => {
      const ready = Boolean(game.url);
      return '┃ ' + (ready ? '🟢' : '⚪') + ' *' + game.name + '* — ' + game.genre
        + '\n┃    ' + (ready ? '.jogar ' + game.id : 'URL global não configurada');
    });

    return reply([
      '╭━━━〔 🎮 ' + title.toUpperCase() + ' 〕━━━╮',
      '┃',
      '┃ 🎲 *MINIJOGOS DO TOGI*',
      '┃ .forca • .anagrama • .adivinhe • .quiz',
      '┃',
      '┣━━〔 🌐 JOGOS NO NAVEGADOR 〕',
      ...external,
      '┃',
      '╰━━━━━━━━━━━━━━━━━━━━━━╯',
      '',
      baseConfigured
        ? '🟢 URL global configurada. Cada jogo precisa ter sua rota publicada no servidor.'
        : '⚪ Configure TOGI_GAMES_URL no .env para gerar os links.',
      'Use *.jogar <id>* para abrir um jogo.'
    ].join('\n'));
  }
};
