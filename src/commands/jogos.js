const GAMES = [
  ['doom', 'DOOM / Freedoom', 'FPS clássico em 3D', 'TOGI_GAME_DOOM_URL'],
  ['quake', 'Quake', 'FPS 3D', 'TOGI_GAME_QUAKE_URL'],
  ['wolf3d', 'Wolfenstein 3D', 'FPS retrô', 'TOGI_GAME_WOLF3D_URL'],
  ['hexen', 'Hexen', 'Ação e fantasia em primeira pessoa', 'TOGI_GAME_HEXEN_URL'],
  ['supertuxkart', 'SuperTuxKart', 'Corrida 3D', 'TOGI_GAME_SUPERTUXKART_URL'],
  ['openttd', 'OpenTTD', 'Estratégia e transporte', 'TOGI_GAME_OPENTTD_URL']
];

function isValidHttps(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export default {
  name: 'jogos',
  aliases: ['games', 'minigames'],
  category: 'games',
  description: 'Mostra o catálogo do Togi Games.',
  async execute({ reply }) {
    const title = process.env.TOGI_GAMES_NAME || 'Togi Games';
    const external = GAMES.map(([id, name, genre, env]) => {
      const url = process.env[env];
      const ready = isValidHttps(url);
      return `┃ ${ready ? '🟢' : '⚪'} *${name}* — ${genre}\n┃    ${ready ? `.jogar ${id}` : 'URL ainda não configurada'}`;
    });

    return reply([
      `╭━━━〔 🎮 ${title.toUpperCase()} 〕━━━╮`,
      '┃',
      '┃ 🎲 *MINIJOGOS DO TOGI*',
      '┃ .forca • .anagrama • .adivinhe • .quiz',
      '┃',
      '┣━━〔 🌐 JOGOS NO NAVEGADOR 〕',
      ...external,
      '┃',
      '╰━━━━━━━━━━━━━━━━━━━━━━╯',
      '',
      '🟢 Configurado | ⚪ Aguardando URL HTTPS',
      'Use *.jogar <id>* para abrir um jogo configurado.'
    ].join('\n'));
  }
};
