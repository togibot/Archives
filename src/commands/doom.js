import { getTogiGameUrl } from '../services/togi-games.js';

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

    const gameUrl = getTogiGameUrl('doom');
    if (!gameUrl) {
      return reply([
        '⚠️ *TOGI DOOM ainda não tem URL configurada.*',
        '',
        'Defina TOGI_GAMES_URL no arquivo .env e publique a rota /doom/ no servidor.',
        '',
        'Consulte docs/DOOM.md para preparar o servidor.'
      ].join('\n'));
    }

    return reply([
      '╭━━━〔 🔥 TOGI DOOM 〕━━━╮',
      '┃ Link de DOOM / Freedoom:',
      '┃',
      '┃ 📱 Controles touch dependem do build',
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
