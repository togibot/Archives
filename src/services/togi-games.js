const GAMES = [
  { id: 'doom', name: 'DOOM / Freedoom', genre: 'FPS clássico em 3D', legacyEnv: 'TOGI_GAME_DOOM_URL' },
  { id: 'quake', name: 'Quake', genre: 'FPS 3D', legacyEnv: 'TOGI_GAME_QUAKE_URL' },
  { id: 'wolf3d', name: 'Wolfenstein 3D', genre: 'FPS retrô', legacyEnv: 'TOGI_GAME_WOLF3D_URL' },
  { id: 'hexen', name: 'Hexen', genre: 'Ação e fantasia em primeira pessoa', legacyEnv: 'TOGI_GAME_HEXEN_URL' },
  { id: 'supertuxkart', name: 'SuperTuxKart', genre: 'Corrida 3D', legacyEnv: 'TOGI_GAME_SUPERTUXKART_URL' },
  { id: 'openttd', name: 'OpenTTD', genre: 'Estratégia e transporte', legacyEnv: 'TOGI_GAME_OPENTTD_URL' }
];

function parseHttpsUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function getTogiGamesBaseUrl() {
  const url = parseHttpsUrl(process.env.TOGI_GAMES_URL);
  if (!url || url.search || url.hash) return null;

  // Preserve an optional base path and normalize it for safe route joining.
  url.pathname = url.pathname.replace(/\\/+$/, '') + '/';
  return url;
}

export function getTogiGameUrl(id) {
  const game = GAMES.find((item) => item.id === String(id || '').toLowerCase());
  if (!game) return null;

  const baseUrl = getTogiGamesBaseUrl();
  let url;

  if (baseUrl) {
    // One global domain, with one path per game: /doom/, /quake/, etc.
    url = new URL(game.id + '/', baseUrl);
  } else {
    // Backward compatibility for installations using the old per-game URL.
    const legacyValue = process.env[game.legacyEnv]
      || (game.id === 'doom' ? process.env.TOGI_DOOM_URL : '');
    url = parseHttpsUrl(legacyValue);
  }

  if (!url) return null;

  if (game.id === 'doom') {
    url.searchParams.set('iwad', 'freedoom1.wad');
    url.searchParams.set('warp', '1,1');
    url.searchParams.set('nomelt', '1');
  }

  return url.toString();
}

export function getTogiGamesCatalog() {
  return GAMES.map((game) => ({
    ...game,
    url: getTogiGameUrl(game.id)
  }));
}
