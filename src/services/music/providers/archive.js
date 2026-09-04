const SEARCH_URL = 'https://archive.org/advancedsearch.php';
const METADATA_URL = 'https://archive.org/metadata/';
const MAX_RESULTS = 15;

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function normalize(value) {
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function score(query, title, artist = '') {
  const q = normalize(query);
  const tokens = q.split(/\s+/).filter(Boolean);
  const t = normalize(title);
  const a = normalize(artist);
  let points = t === q ? 100000 : t.includes(q) ? 30000 : 0;
  let matched = 0;
  for (const token of tokens) {
    if (t.includes(token)) { points += 7000; matched++; }
    else if (a.includes(token)) { points += 4000; matched++; }
  }
  if (tokens.length) points += (matched / tokens.length) * 15000;
  return points;
}

function allowedLicense(value) {
  const license = normalize(value);
  return license.includes('creativecommons.org') || license.includes('publicdomain');
}

function playableFile(file) {
  const name = clean(file?.name);
  if (!name || !/^https?:\/\//i.test(file?.url || '')) return false;
  return /\.(mp3|m4a|ogg|opus|wav|flac)$/i.test(name);
}

export async function searchArchive(query) {
  const params = new URLSearchParams({
    q: `${query} AND mediatype:audio`,
    fl: 'identifier,title,creator,licenseurl',
    rows: String(MAX_RESULTS),
    output: 'json',
    sort: 'downloads desc'
  });

  const response = await fetch(`${SEARCH_URL}?${params}`);
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  const docs = Array.isArray(data?.response?.docs) ? data.response.docs : [];

  const candidates = [];
  for (const doc of docs) {
    if (!doc?.identifier || !allowedLicense(doc.licenseurl)) continue;
    const metadata = await fetch(`${METADATA_URL}${encodeURIComponent(doc.identifier)}`)
      .then(r => r.ok ? r.json() : null).catch(() => null);
    if (!metadata) continue;

    const files = Array.isArray(metadata.files) ? metadata.files : [];
    const file = files.find(playableFile);
    if (!file) continue;

    const title = clean(doc.title, clean(metadata.metadata?.title, 'Áudio'));
    const artist = clean(doc.creator, clean(metadata.metadata?.creator, 'Artista desconhecido'));
    candidates.push({
      track: {
        name: title,
        artist_name: artist,
        duration: Number(file.length || 0),
        audiodownload: file.url,
        source: 'Internet Archive',
        license: clean(doc.licenseurl),
        url: `https://archive.org/details/${doc.identifier}`
      },
      score: score(query, title, artist)
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.track || null;
}
