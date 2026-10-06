const SEARCH_SOURCES = [
  {
    name: 'Bing Images',
    buildUrl: (query, page = 0) =>
      `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&adlt=strict&first=${page * 35 + 1}`,
    marker: '"murl":"'
  },
  {
    name: 'Google Images',
    buildUrl: (query, page = 0) =>
      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}&start=${page * 20}`,
    marker: '"ou":"'
  }
];

const STYLE_QUERIES = {
  mm: ['two boys matching pfp', 'boys matching profile pictures', 'male matching pfp'],
  ff: ['two girls matching pfp', 'girls matching profile pictures', 'female matching pfp'],
  mf: ['boy girl matching pfp', 'boy and girl matching profile pictures', 'male female matching pfp'],
  random: ['matching pfp friends', 'matching profile pictures', 'matching pfp pair']
};

function normalize(value) {
  return String(value || '')
    .trim()
    .replaceAll('\n', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\t', ' ')
    .split(' ')
    .filter(Boolean)
    .join(' ')
    .slice(0, 60);
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

function themeTokens(theme) {
  return normalize(theme)
    .toLowerCase()
    .split(' ')
    .filter(token => token.length >= 3);
}

function candidateMatchesTheme(candidate, theme) {
  const tokens = themeTokens(theme);
  if (!tokens.length) return true;

  const haystack = [
    candidate.url,
    candidate.pageUrl,
    candidate.title,
    candidate.query
  ].join(' ').toLowerCase();

  // Para temas com várias palavras, exigimos que pelo menos a maioria
  // apareça no contexto do resultado. Isso reduz muito resultados aleatórios.
  const matches = tokens.filter(token => haystack.includes(token)).length;
  return matches >= Math.max(1, Math.ceil(tokens.length * 0.6));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36',
      'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
    },
    redirect: 'follow'
  });

  if (!response.ok) throw new Error(`Fonte respondeu HTTP ${response.status}`);
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

  if (!response.ok) throw new Error(`Imagem respondeu HTTP ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length > 8 * 1024 * 1024) throw new Error('Imagem muito grande.');
  if (!contentType.startsWith('image/')) throw new Error('Resultado não é uma imagem.');

  return { buffer, mimeType: contentType.split(';')[0] || 'image/jpeg', url };
}

async function splitMatchingPair(image) {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default || sharpModule;
    const metadata = await sharp(image.buffer).metadata();

    const width = Number(metadata.width || 0);
    const height = Number(metadata.height || 0);
    if (width < 500 || height < 500) return null;

    const ratio = width / height;

    // Cada metade precisa ser aproximadamente QUADRADA.
    // Isso impede pegar uma foto de duas pessoas e cortar na cintura.
    if (ratio < 1.78 || ratio > 2.22) return null;

    const halfWidth = Math.floor(width / 2);
    const halfRatio = halfWidth / height;

    if (halfRatio < 0.82 || halfRatio > 1.18) return null;

    const left = await sharp(image.buffer)
      .extract({ left: 0, top: 0, width: halfWidth, height })
      .jpeg({ quality: 92 })
      .toBuffer();

    const right = await sharp(image.buffer)
      .extract({ left: halfWidth, top: 0, width: width - halfWidth, height })
      .jpeg({ quality: 92 })
      .toBuffer();

    return [
      { buffer: left, mimeType: 'image/jpeg', sourceUrl: image.url },
      { buffer: right, mimeType: 'image/jpeg', sourceUrl: image.url }
    ];
  } catch {
    return null;
  }
}

export function buildMetadinhaQueries(theme = 'anime', type = 'random') {
  const cleanTheme = normalize(theme) || 'anime';
  const bases = STYLE_QUERIES[type] || STYLE_QUERIES.random;

  return bases.flatMap(base => [
    `"${cleanTheme}" ${base} side by side square pfp`,
    `"${cleanTheme}" ${base} two square profile pictures`,
    `"${cleanTheme}" ${base} matching pfp collage`,
    `"${cleanTheme}" ${base} matching pfp pair`
  ]);
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
  const candidateSeen = new Set();

  for (const source of SEARCH_SOURCES) {
    for (const query of queries) {
      for (let page = 0; page < 4; page += 1) {
        try {
          const html = await fetchText(source.buildUrl(query, page));
          const urls = extractMarkedUrls(decodeHtml(html), source.marker);

          for (const url of urls) {
            if (candidateSeen.has(url)) continue;
            candidateSeen.add(url);

            const candidate = {
              url,
              pageUrl: '',
              title: '',
              source: source.name,
              query
            };

            if (candidateMatchesTheme(candidate, theme)) {
              candidates.push(candidate);
            }

            if (candidates.length >= 220) break;
          }
        } catch {}

        if (candidates.length >= 220) break;
      }

      if (candidates.length >= 220) break;
    }

    if (candidates.length >= 220) break;
  }

  // Primeiro tentamos somente resultados fortemente relacionados ao tema.
  // Só aceitamos uma imagem cujo próprio arquivo contenha os dois PFPs.
  for (const candidate of candidates) {
    try {
      const image = await downloadImage(candidate.url);
      const pair = await splitMatchingPair(image);
      if (pair) return pair;
    } catch {}
  }

  throw new Error('Não encontrei um par de metadinhas compatível com esse tema. Tente outro tema.');
}
