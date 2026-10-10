const SEARCH_URL = 'https://api.sticker.ly/v4/stickerPack/smartSearch';
const DETAIL_URL = 'https://api.sticker.ly/v4/stickerPack';
const USER_AGENT = 'androidapp.stickerly/3.30.1 (sdk_gphone64_x86_64; U; Android 31; pt-BR; br;)';
const SEARCH_CACHE_TTL = 2 * 60 * 1000;
const SELECTION_TTL = 10 * 60 * 1000;
const cache = new Map();
const selections = new Map();

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function normalizePack(pack) {
  const files = Array.isArray(pack?.resourceFiles) ? pack.resourceFiles : [];
  const trayIndex = Number.isInteger(pack?.trayIndex) ? pack.trayIndex : 0;
  const prefix = String(pack?.resourceUrlPrefix || '');
  const trayFile = files[trayIndex] || files[0] || '';
  const shareUrl = clean(pack?.shareUrl);
  const shareCode = shareUrl.match(/\/s\/([^/?#]+)/i)?.[1] || '';

  return {
    id: clean(shareCode || pack?.packId),
    name: clean(pack?.name, 'Pack sem nome'),
    author: clean(pack?.authorName, 'Autor desconhecido'),
    stickerCount: files.length || Number(pack?.stickerCount || 0),
    viewCount: Number(pack?.viewCount || 0),
    exportCount: Number(pack?.exportCount || 0),
    isAnimated: Boolean(pack?.isAnimated),
    isPaid: Boolean(pack?.isPaid),
    url: shareUrl,
    thumbnailUrl: prefix && trayFile ? `${prefix}${trayFile}` : ''
  };
}

function score(pack) {
  return (pack.exportCount * 2) + pack.viewCount + (pack.stickerCount * 50);
}

function selectionKey(chat, sender) {
  return `${String(chat || '')}|${String(sender || '')}`;
}

async function fetchJson(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'user-agent': USER_AGENT,
        'accept-encoding': 'gzip',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Sticker.ly respondeu HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function searchStickerPacks(query, limit = 8) {
  const keyword = clean(query);
  if (!keyword) return [];

  const normalizedLimit = Math.max(1, Math.min(12, Number(limit) || 8));
  const key = keyword.toLowerCase();
  const cached = cache.get(key);

  if (cached && Date.now() - cached.at < SEARCH_CACHE_TTL) {
    return cached.items.slice(0, normalizedLimit);
  }

  const data = await fetchJson(SEARCH_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
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
    })
  });

  const raw = Array.isArray(data?.result?.stickerPacks)
    ? data.result.stickerPacks
    : [];

  const items = raw
    .map(normalizePack)
    .filter(pack => pack.id && pack.url && pack.stickerCount >= 3 && !pack.isPaid)
    .sort((a, b) => score(b) - score(a));

  cache.set(key, { at: Date.now(), items });
  return items.slice(0, normalizedLimit);
}

export function saveStickerPackSelection(chat, sender, query, packs) {
  const items = Array.isArray(packs) ? packs.map(pack => ({ ...pack })) : [];
  selections.set(selectionKey(chat, sender), {
    at: Date.now(),
    query: clean(query),
    packs: items
  });
}

export function getStickerPackSelection(chat, sender, position) {
  const key = selectionKey(chat, sender);
  const entry = selections.get(key);

  if (!entry) return { error: 'missing' };
  if (Date.now() - entry.at > SELECTION_TTL) {
    selections.delete(key);
    return { error: 'expired' };
  }

  const index = Number(position) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= entry.packs.length) {
    return { error: 'position', count: entry.packs.length };
  }

  return {
    query: entry.query,
    pack: entry.packs[index],
    position: index + 1,
    count: entry.packs.length
  };
}

export async function getStickerPackDetail(pack) {
  const packId = clean(pack?.id);
  if (!packId) throw new Error('Pack sem identificador.');

  const data = await fetchJson(
    `${DETAIL_URL}/${encodeURIComponent(packId)}?needRelation=true`,
    { method: 'GET' }
  );

  const result = data?.result;
  if (!result || typeof result !== 'object') {
    throw new Error('Pack não encontrado.');
  }

  const prefix = String(result.resourceUrlPrefix || '');
  const rawStickers = Array.isArray(result.stickers) ? result.stickers : [];

  const stickers = rawStickers.map((sticker, index) => {
    const fileName = clean(sticker?.fileName);
    const url = clean(sticker?.resourceUrl) || (prefix && fileName ? `${prefix}${fileName}` : '');
    return {
      index: index + 1,
      url,
      isAnimated: Boolean(sticker?.isAnimated)
    };
  }).filter(sticker => sticker.url);

  if (!stickers.length) {
    throw new Error('Esse pack não possui FIGs disponíveis.');
  }

  return {
    id: packId,
    name: clean(result?.name, pack?.name || 'Pack sem nome'),
    author: clean(result?.user?.displayName || result?.authorName, pack?.author || 'Autor desconhecido'),
    stickers
  };
}

export async function downloadStickerFile(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { 'user-agent': USER_AGENT },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`download HTTP ${response.status}`);
    }

    const length = Number(response.headers.get('content-length') || 0);
    if (length > 5 * 1024 * 1024) {
      throw new Error('FIG maior que 5 MB');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) throw new Error('FIG vazia');
    if (buffer.length > 5 * 1024 * 1024) throw new Error('FIG maior que 5 MB');

    return buffer;
  } finally {
    clearTimeout(timer);
  }
}
