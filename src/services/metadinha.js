const SEARCH_SOURCES = [
  {
    name: 'Bing Images',
    buildUrl: (query) =>
      `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&adlt=strict`,
    marker: '"murl":"'
  }
];

const STYLE_QUERIES = {
  mm: 'two boys matching pfp',
  ff: 'two girls matching pfp',
  mf: 'boy girl matching pfp',
  random: 'matching pfp friends'
};

function normalize(value) {
  return String(value || '').trim().split(/\\s+/).filter(Boolean).join(' ').slice(0, 60);
}

function decodeHtml(value) {
  return String(value || '')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function extractMarkedUrls(html, marker) {
  const urls = [];
  const seen = new Set();
  let cursor = 0;

  while (true) {
    const start = html.indexOf(marker, cursor);
    if (start === -1) break;

    const valueStart = start + marker.length;
    const valueEnd = html.indexOf('"', valueStart);
    if (valueEnd === -1) break;

    const url = html.slice(valueStart, valueEnd).replaceAll('\\/', '/');

    if ((url.startsWith('http://') || url.startsWith('https://')) && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }

    cursor = valueEnd + 1;
  }

  return urls;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36',
      'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Fonte respondeu HTTP ${response.status}`);
  }

  return response.text();
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36',
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Imagem respondeu HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Imagem muito grande.');
  }

  if (!contentType.startsWith('image/')) {
    throw new Error('Resultado não é uma imagem.');
  }

  return {
    buffer,
    mimeType: contentType.split(';')[0] || 'image/jpeg',
    url
  };
}

export function buildMetadinhaQueries(theme = 'anime', type = 'random') {
  const cleanTheme = normalize(theme) || 'anime';
  const base = STYLE_QUERIES[type] || STYLE_QUERIES.random;

  return [
    `${cleanTheme} ${base} complete two image set`,
    `${cleanTheme} matching profile pictures complete pair`,
    `${cleanTheme} matching pfp pair set`
  ];
}

export function getMetadinhaOptions() {
  return [
    { key: 'mm', label: '👦 + 👦 Menino + Menino' },
    { key: 'ff', label: '👧 + 👧 Menina + Menina' },
    { key: 'mf', label: '👦 + 👧 Menino + Menina' },
    { key: 'random', label: '🎲 Aleatório' }
  ];
}

export function getPublicSearchSources() {
  return SEARCH_SOURCES.map(source => source.name);
}

export async function searchMetadinhaImages(theme = 'anime', type = 'random') {
  const queries = buildMetadinhaQueries(theme, type);
  const candidates = [];

  for (const source of SEARCH_SOURCES) {
    for (const query of queries) {
      try {
        const html = await fetchText(source.buildUrl(query));
        const urls = extractMarkedUrls(decodeHtml(html), source.marker);

        for (const url of urls) {
          candidates.push({
            url,
            source: source.name,
            query
          });
        }
      } catch {}
    }
  }

  const unique = [];
  const seen = new Set();

  for (const candidate of candidates) {
    if (seen.has(candidate.url)) continue;
    seen.add(candidate.url);

    try {
      const image = await downloadImage(candidate.url);
      unique.push({
        ...image,
        source: candidate.source,
        query: candidate.query
      });

      if (unique.length >= 8) break;
    } catch {}
  }

  if (unique.length < 2) {
    throw new Error('Não encontrei duas imagens válidas agora. Tente outro tema.');
  }

  return unique;
}
