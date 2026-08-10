const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
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
  if (title === q) score += 100000;
  else if (title.startsWith(`${q} `)) score += 50000;
  else if (title.includes(q)) score += 30000;
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

  if (qTokens.length) score += (matched / qTokens.length) * 10000;
  if (matched < qTokens.length && qTokens.length >= 2) score *= matched / qTokens.length;
  return score;
}

function popularityScore(track) {
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

function getYouTubeKey() {
  return String(process.env.YOUTUBE_API_KEY || '').trim();
}

function isYouTubeQuotaError(status, data) {
  return status === 403 && Array.isArray(data?.error?.errors)
    && data.error.errors.some(error => error?.reason === 'quotaExceeded');
}

export async function searchYouTubeTrack(query) {
  const apiKey = getYouTubeKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '5',
    videoCategoryId: '10'
  });

  const response = await fetch(`${YOUTUBE_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));

  if (isYouTubeQuotaError(response.status, data)) {
    const error = new Error('YOUTUBE_QUOTA_EXCEEDED');
    error.code = 'YOUTUBE_QUOTA_EXCEEDED';
    throw error;
  }

  if (!response.ok) {
    // A search failure other than quota exhaustion should not take music offline.
    return null;
  }

  const item = Array.isArray(data.items) ? data.items[0] : null;
  if (!item?.snippet) return null;

  return {
    title: clean(item.snippet.title),
    artist: clean(item.snippet.channelTitle)
  };
}

export async function searchPlayableTrack(query) {
  const clientId = getClientId();

  // YouTube is used only to improve identification. The actual audio still
  // comes from Jamendo's permitted-download catalog.
  let searchQuery = query;
  const youtubeTrack = await searchYouTubeTrack(query);
  if (youtubeTrack?.title) {
    searchQuery = youtubeTrack.artist
      ? `${youtubeTrack.title} ${youtubeTrack.artist}`
      : youtubeTrack.title;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    namesearch: searchQuery,
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
      relevance: relevanceScore(searchQuery, track),
      popularity: popularityScore(track)
    }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => (b.relevance + b.popularity) - (a.relevance + a.popularity));

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
