const DEFAULT_PAGE_SIZE = 40;
const CACHE_TTL = 24 * 60 * 60 * 1000;
const cache = new Map();

function normalizeQuery(query) {
  return String(query || 'anime').trim().replace(/\s+/g, ' ').slice(0, 80) || 'anime';
}

function buildQueries(query) {
  const q = normalizeQuery(query);
  return [
    `matching profile pictures ${q}`,
    `matching pfp ${q}`,
    `best friends profile pictures ${q}`
  ];
}

async function pexelsSearch(query, apiKey) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(DEFAULT_PAGE_SIZE));
  url.searchParams.set('orientation', 'square');
  url.searchParams.set('locale', 'pt-BR');

  const response = await fetch(url, {
    headers: { Authorization: apiKey }
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('A chave da Pexels é inválida.');
    if (response.status === 429) throw new Error('A API de imagens atingiu o limite de requisições.');
    throw new Error(`Pexels respondeu com HTTP ${response.status}.`);
  }

  return response.json();
}

function pickPair(photos) {
  if (!Array.isArray(photos) || photos.length < 2) return null;

  const usable = photos.filter(photo =>
    photo?.src?.medium &&
    photo?.src?.small &&
    photo?.photographer &&
    photo?.url
  );

  if (usable.length < 2) return null;

  const first = usable[Math.floor(Math.random() * usable.length)];
  const rest = usable.filter(photo => photo.id !== first.id);
  const second = rest[Math.floor(Math.random() * rest.length)];

  return { first, second };
}

export async function searchMatchingPair(query, apiKey = process.env.PEXELS_API_KEY) {
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY não configurada no .env.');
  }

  const key = normalizeQuery(query).toLowerCase();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return pickPair(cached.photos);
  }

  const queries = buildQueries(query);
  let photos = [];

  for (const searchQuery of queries) {
    const data = await pexelsSearch(searchQuery, apiKey);
    photos.push(...(data.photos || []));
    if (photos.length >= 12) break;
  }

  const unique = [...new Map(photos.map(photo => [photo.id, photo])).values()];
  cache.set(key, { photos: unique, expiresAt: Date.now() + CACHE_TTL });

  return pickPair(unique);
}
