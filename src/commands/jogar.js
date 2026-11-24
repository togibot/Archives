import { getTogiGameUrl } from '../services/togi-games.js';

const GAME_NAMES = {
  doom: 'DOOM / Freedoom',
  quake: 'Quake',
  wolf3d: 'Wolfenstein 3D',
  hexen: 'Hexen',
  supertuxkart: 'SuperTuxKart',
  openttd: 'OpenTTD'
};

export default {
  name: 'jogar',
  aliases: ['play'],
  category: 'games',
  description: 'Abre um jogo do catálogo Togi Games.',
  async execute({ args = [], reply }) {
    const id = String(args[0] || '').toLowerCase();
    if (!id || ['ajuda', 'help', 'lista'].includes(id)) {
      return reply('🎮 *TOGI GAMES*\n\nUse *.jogos* para ver o catálogo.\nExemplo: *.jogar doom*');
    }

    const gameName = GAME_NAMES[id];
    if (!gameName) {
      return reply('❌ Jogo não encontrado. Use *.jogos* para consultar o catálogo.');
    }

    const url = getTogiGameUrl(id);
    if (!url) {
      return reply(
        '⚪ *' + gameName + '* ainda não tem link configurado.\n\n'
        + 'Defina uma única URL-base HTTPS em TOGI_GAMES_URL no arquivo .env. '
        + 'O servidor também precisa publicar a rota /' + id + '/.'
      );
    }

    return reply(
      '🎮 *TOGI GAMES — ' + gameName + '*\n\n'
      + '▶️ Abra o jogo pelo link:\n' + url + '\n\n'
      + 'A rota do jogo precisa estar publicada no servidor. Para sair, feche a aba do navegador.'
    );
  }
};
