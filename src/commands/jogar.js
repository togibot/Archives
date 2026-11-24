const GAMES = {
  doom: { name: 'DOOM / Freedoom', env: 'TOGI_GAME_DOOM_URL' },
  quake: { name: 'Quake', env: 'TOGI_GAME_QUAKE_URL' },
  wolf3d: { name: 'Wolfenstein 3D', env: 'TOGI_GAME_WOLF3D_URL' },
  hexen: { name: 'Hexen', env: 'TOGI_GAME_HEXEN_URL' },
  supertuxkart: { name: 'SuperTuxKart', env: 'TOGI_GAME_SUPERTUXKART_URL' },
  openttd: { name: 'OpenTTD', env: 'TOGI_GAME_OPENTTD_URL' }
};

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

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

    const game = GAMES[id];
    if (!game) return reply('❌ Jogo não encontrado. Use *.jogos* para consultar o catálogo.');

    // Keep the original DOOM variable compatible with existing deployments.
    const configured = process.env[game.env] || (id === 'doom' ? process.env.TOGI_DOOM_URL : '');
    const url = safeHttpsUrl(configured);
    if (!url) {
      return reply(`⚪ *${game.name}* ainda não está configurado.\n\nAdicione uma URL pública HTTPS em ${game.env} no arquivo .env e hospede o jogo antes de tentar novamente.`);
    }

    return reply(`🎮 *TOGI GAMES — ${game.name}*\n\n▶️ Abra o jogo pelo link:\n${url}\n\nPara sair, feche a aba do navegador.`);
  }
};
