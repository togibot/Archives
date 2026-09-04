const SEARCH_URL = 'https://archive.org/advancedsearch.php';
const METADATA_URL = 'https://archive.org/metadata/';
const DOWNLOAD_URL = 'https://archive.org/download/';
const MAX_RESULTS = 15;

function clean(value, fallback = '') {
  if (Array.isArray(value)) value = value.join(' ');
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
  return license.includes('creativecommons.org')
    || license.includes('publicdomain')
    || license.includes('public domain');
}

function getLicense(doc, metadata) {
  return clean(
    doc?.licenseurl
      || metadata?.metadata?.licenseurl
      || metadata?.metadata?.license
      || metadata?.metadata?.rights
      || ''
  );
}

function playableFile(file, identifier) {
  const name = clean(file?.name);
  if (!name || !identifier) return false;
  if (/\.(mp3|m4a|ogg|opus|wav|flac)$/i.test(name) === false) return false;

  const directUrl = clean(file?.url);
  const url = /^https?:\/\//i.test(directUrl)
    ? directUrl
    : `${DOWNLOAD_URL}${encodeURIComponent(identifier)}/${name.split('/').map(encodeURIComponent).join('/')}`;

  return { ...file, url };
}

export async function searchArchive(query) {
  const params = new URLSearchParams({
    q: `(${query}) AND mediatype:audio`,
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
    if (!doc?.identifier) continue;

    const metadata = await fetch(`${METADATA_URL}${encodeURIComponent(doc.identifier)}`)
      .then(r => r.ok ? r.json() : null).catch(() => null);
    if (!metadata) continue;

    const license = getLicense(doc, metadata);
    if (!allowedLicense(license)) continue;

    const files = Array.isArray(metadata.files) ? metadata.files : [];
    const file = files.map(item => playableFile(item, doc.identifier)).find(Boolean);
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
        license,
        url: `https://archive.org/details/${doc.identifier}`
      },
      score: score(query, title, artist)
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.track || null;
}
