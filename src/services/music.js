const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);

function getClientId() {
  const clientId = String(process.env.JAMENDO_CLIENT_ID || '').trim();
  if (!clientId) throw new Error('JAMENDO_CLIENT_ID não configurado');
  return clientId;
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function relevanceScore(query, track) {
  const q = normalize(query);
  const qTokens = tokenize(query);
  const title = normalize(track?.name);
  const artist = normalize(track?.artist_name);
  const titleTokens = new Set(tokenize(track?.name));
  const artistTokens = new Set(tokenize(track?.artist_name));

  if (!q || !title) return 0;

  let score = 0;

  // Exact title is overwhelmingly more important than popularity.
  if (title === q) score += 100000;
  else if (title.startsWith(`${q} `)) score += 50000;
  else if (title.includes(q)) score += 30000;

  // Exact artist/query match is useful for queries containing an artist name.
  if (artist === q) score += 15000;
  if (`${title} ${artist}` === q) score += 100000;

  let matched = 0;
  for (const token of qTokens) {
    if (titleTokens.has(token)) {
      score += 5000;
      matched++;
    } else if (artistTokens.has(token)) {
      score += 2500;
      matched++;
    }
  }

  // Penalize results that match only a small part of a multi-word query.
  if (qTokens.length) score += (matched / qTokens.length) * 10000;
  if (matched < qTokens.length && qTokens.length >= 2) score *= matched / qTokens.length;

  return score;
}

function popularityScore(track) {
  // Jamendo exposes popularity/rating signals; use them only as a tie-breaker
  // so a popular but unrelated track cannot beat a strong title match.
  const popularity = Number(track?.popularity) || 0;
  const rating = Number(track?.rating) || 0;
  const likes = Number(track?.likes) || 0;
  const playcount = Number(track?.playcount) || 0;
  const downloads = Number(track?.downloads) || 0;

  return (popularity * 10) + (rating * 2)
    + Math.log10(1 + likes)
    + Math.log10(1 + playcount)
    + Math.log10(1 + downloads);
}

export async function searchPlayableTrack(query) {
  const clientId = getClientId();
  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    namesearch: query,
    type: 'single albumtrack',
    audioformat: 'mp32',
    audiodlformat: 'mp32',
    limit: '25',
    order: 'relevance',
    boost: 'popularity_month'
  });

  const response = await fetch(`${JAMENDO_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.headers?.status !== 'success') {
    throw new Error(data?.headers?.error_message || `Jamendo HTTP ${response.status}`);
  }

  const candidates = (Array.isArray(data.results) ? data.results : [])
    .filter(track => track?.audiodownload_allowed && track?.audiodownload)
    .map(track => ({
      track,
      relevance: relevanceScore(query, track),
      popularity: popularityScore(track)
    }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => {
      const scoreA = a.relevance + a.popularity;
      const scoreB = b.relevance + b.popularity;
      return scoreB - scoreA;
    });

  // Never return a merely popular track when the query has no meaningful match.
  const best = candidates[0];
  if (!best || best.relevance < 5000) return null;

  return best.track;
}

export async function downloadTrack(track) {
  const url = clean(track?.audiodownload);
  if (!url) throw new Error('Esta faixa não possui download permitido.');

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar o áudio (HTTP ${response.status}).`);

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_AUDIO_BYTES) throw new Error('O áudio excede o limite permitido pelo Togi.');

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error('O áudio retornado está vazio.');
  if (buffer.length > MAX_AUDIO_BYTES) throw new Error('O áudio excede o limite permitido pelo Togi.');
  return buffer;
}

export function getTrackFileName(track) {
  const title = clean(track?.name) || 'togi-audio';
  const artist = clean(track?.artist_name);
  const base = artist ? `${title} - ${artist}` : title;
  return `${base.replace(/[\\/:*?"<>|]/g, '').slice(0, 100)}.mp3`;
}
