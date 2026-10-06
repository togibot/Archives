const SEARCH_SOURCES = [
  {
    name: 'Bing Images',
    buildUrl: (query, page = 0) =>
      `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&adlt=strict&first=${page * 35 + 1}`,
    marker: '"murl":"'
  }
];

const STYLE_QUERIES = {
  mm: [
    'two boys matching pfp pair',
    'boys matching profile pictures pair',
    'male matching pfp pair'
  ],
  ff: [
    'two girls matching pfp pair',
    'girls matching profile pictures pair',
    'female matching pfp pair'
  ],
  mf: [
    'boy girl matching pfp pair',
    'boy and girl matching profile pictures pair',
    'male female matching pfp pair'
  ],
  random: [
    'matching pfp pair friends',
    'matching profile pictures pair',
    'matching pfp two halves'
  ]
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

  return { buffer, mimeType: contentType.split(';')[0] || 'image/jpeg', url };
}

async function splitMatchingPair(image) {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default || sharpModule;
    const metadata = await sharp(image.buffer).metadata();

    const width = Number(metadata.width || 0);
    const height = Number(metadata.height || 0);

    if (width < 300 || height < 300) return null;

    const horizontalRatio = width / height;
    const verticalRatio = height / width;

    // Matching PFPs podem vir com bordas, molduras ou espaços,
    // então não exigimos mais um formato exatamente 2:1.
    if (horizontalRatio >= 1.20) {
      const halfWidth = Math.floor(width / 2);

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
    }

    if (verticalRatio >= 1.20) {
      const halfHeight = Math.floor(height / 2);

      const top = await sharp(image.buffer)
        .extract({ left: 0, top: 0, width, height: halfHeight })
        .jpeg({ quality: 92 })
        .toBuffer();

      const bottom = await sharp(image.buffer)
        .extract({ left: 0, top: halfHeight, width, height: height - halfHeight })
        .jpeg({ quality: 92 })
        .toBuffer();

      return [
        { buffer: top, mimeType: 'image/jpeg', sourceUrl: image.url },
        { buffer: bottom, mimeType: 'image/jpeg', sourceUrl: image.url }
      ];
    }

    return null;
  } catch {
    return null;
  }
}

export function buildMetadinhaQueries(theme = 'anime', type = 'random') {
  const cleanTheme = normalize(theme) || 'anime';
  const bases = STYLE_QUERIES[type] || STYLE_QUERIES.random;

  return bases.flatMap(base => [
    `${cleanTheme} ${base}`,
    `${cleanTheme} ${base} complete set`,
    `${cleanTheme} ${base} split pfp`
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
            candidates.push({ url, source: source.name, query });

            if (candidates.length >= 140) break;
          }
        } catch {}

        if (candidates.length >= 140) break;
      }

      if (candidates.length >= 140) break;
    }

    if (candidates.length >= 140) break;
  }

  for (const candidate of candidates) {
    try {
      const image = await downloadImage(candidate.url);
      const pair = await splitMatchingPair(image);

      if (pair) return pair;
    } catch {}
  }

  throw new Error('Não encontrei um par completo nos resultados. Tente novamente.');
}
