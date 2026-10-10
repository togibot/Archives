const SEARCH_URL = 'https://api.sticker.ly/v4/stickerPack/smartSearch';
const USER_AGENT = 'androidapp.stickerly/3.30.1 (sdk_gphone64_x86_64; U; Android 31; pt-BR; br;)';
const CACHE_TTL = 2 * 60 * 1000;
const cache = new Map();

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function normalizePack(pack) {
  const files = Array.isArray(pack?.resourceFiles) ? pack.resourceFiles : [];
  const trayIndex = Number.isInteger(pack?.trayIndex) ? pack.trayIndex : 0;
  const prefix = String(pack?.resourceUrlPrefix || '');
  const trayFile = files[trayIndex] || files[0] || '';

  return {
    id: clean(pack?.packId),
    name: clean(pack?.name, 'Pack sem nome'),
    author: clean(pack?.authorName, 'Autor desconhecido'),
    stickerCount: files.length || Number(pack?.stickerCount || 0),
    viewCount: Number(pack?.viewCount || 0),
    exportCount: Number(pack?.exportCount || 0),
    isAnimated: Boolean(pack?.isAnimated),
    isPaid: Boolean(pack?.isPaid),
    url: clean(pack?.shareUrl),
    thumbnailUrl: prefix && trayFile ? `${prefix}${trayFile}` : ''
  };
}

function score(pack) {
  return (pack.exportCount * 2) + pack.viewCount + (pack.stickerCount * 50);
}

export async function searchStickerPacks(query, limit = 8) {
  const keyword = clean(query);
  if (!keyword) return [];

  const normalizedLimit = Math.max(1, Math.min(12, Number(limit) || 8));
  const key = keyword.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return cached.items.slice(0, normalizedLimit);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'user-agent': USER_AGENT,
        'content-type': 'application/json',
        'accept-encoding': 'gzip',
        'x-duid': '15e99bb22a8ea7b4'
      },
      body: JSON.stringify({
        keyword,
        limit: Math.max(normalizedLimit, 12),
        enabledKeywordSearch: true,
        filter: {
          extendSearchResult: false,
          sortBy: 'RECOMMENDED',
          languages: ['ALL'],
          minStickerCount: 3,
          searchBy: 'ALL',
          stickerType: 'ALL'
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Sticker.ly respondeu HTTP ${response.status}`);
    }

    const data = await response.json();
    const raw = Array.isArray(data?.result?.stickerPacks)
      ? data.result.stickerPacks
      : [];

    const items = raw
      .map(normalizePack)
      .filter(pack => pack.url && pack.stickerCount >= 3 && !pack.isPaid)
      .sort((a, b) => score(b) - score(a));

    cache.set(key, { at: Date.now(), items });
    return items.slice(0, normalizedLimit);
  } finally {
    clearTimeout(timer);
  }
}
