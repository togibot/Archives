const API_URL = 'https://commons.wikimedia.org/w/api.php';
const MAX_RESULTS = 12;

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function normalize(value) {
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function score(query, title) {
  const q = normalize(query);
  const t = normalize(title);
  if (!q || !t) return 0;
  if (t === q) return 100000;
  if (t.includes(q)) return 30000;
  const tokens = q.split(/\s+/).filter(Boolean);
  const matched = tokens.filter(token => t.includes(token)).length;
  return matched ? (matched / tokens.length) * 15000 : 0;
}

function isAllowedLicense(info) {
  const text = normalize(
    info?.extmetadata?.LicenseShortName?.value ||
    info?.extmetadata?.UsageTerms?.value ||
    info?.extmetadata?.LicenseUrl?.value ||
    ''
  );
  return text.includes('creative commons')
    || text.includes('public domain')
    || text.includes('cc0')
    || text.includes('free art license');
}

export async function searchWikimediaAudio(query) {
  const text = clean(query);
  if (!text) return null;

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: text,
    gsrnamespace: '6',
    gsrlimit: String(MAX_RESULTS),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    format: 'json',
    origin: '*'
  });

  const response = await fetch(API_URL + '?' + params.toString());
  if (!response.ok) return null;

  const data = await response.json().catch(() => ({}));
  const pages = Object.values(data?.query?.pages || {});

  const candidates = pages.map(page => {
    const info = page?.imageinfo?.[0];
    const mime = clean(info?.mime);
    return {
      page,
      info,
      score: score(text, page?.title || ''),
      playable: Boolean(info?.url && /^audio\//i.test(mime) && isAllowedLicense(info))
    };
  }).filter(item => item.playable && item.score >= 5000);

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best) return null;

  const info = best.info;
  const title = clean(best.page?.title, 'Áudio Wikimedia').replace(/^File:/i, '');
  const artist = clean(
    info?.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, ''),
    'Artista desconhecido'
  );
  const license = clean(
    info?.extmetadata?.LicenseShortName?.value ||
    info?.extmetadata?.UsageTerms?.value,
    'Licença livre'
  );

  return {
    name: title,
    artist_name: artist,
    duration: Number(info?.extmetadata?.Length?.value || 0) || 0,
    audiodownload: info.url,
    source: 'Wikimedia Commons',
    license,
    url: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(best.page.title)
  };
}