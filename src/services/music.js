const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const FMA_BASE_URL = 'https://freemusicarchive.org/api/get/tracks.json';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const ITUNES_BASE_URL = 'https://itunes.apple.com/search';
const DEEZER_BASE_URL = 'https://api.deezer.com/search';
const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);

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

function scoreText(query, title, artist = '') {
  const q = normalize(query);
  const qTokens = tokenize(query);
  const t = normalize(title);
  const a = normalize(artist);
  if (!q || !t) return 0;

  let score = 0;
  if (t === q) score += 100000;
  else if (t.startsWith(`${q} `)) score += 50000;
  else if (t.includes(q)) score += 30000;
  if (`${t} ${a}` === q) score += 50000;

  const titleTokens = new Set(tokenize(title));
  const artistTokens = new Set(tokenize(artist));
  let matched = 0;
  for (const token of qTokens) {
    if (titleTokens.has(token)) {
      score += 7000;
      matched++;
    } else if (artistTokens.has(token)) {
      score += 4000;
      matched++;
    }
  }

  if (qTokens.length) score += (matched / qTokens.length) * 15000;
  if (matched < qTokens.length && qTokens.length >= 2) score *= matched / qTokens.length;
  return score;
}

function getFmaKey() {
  return clean(process.env.FMA_KEY || process.env.FMA_API_KEY);
}

function getJamendoClientId() {
  return clean(process.env.JAMENDO_CLIENT_ID);
}

function getYouTubeKey() {
  return clean(process.env.YOUTUBE_API_KEY);
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
  if (!response.ok) return null;

  const item = Array.isArray(data.items) ? data.items[0] : null;
  if (!item?.snippet) return null;
  return {
    title: clean(item.snippet.title),
    artist: clean(item.snippet.channelTitle),
    source: 'YouTube'
  };
}

export async function searchITunesTrack(query) {
  const params = new URLSearchParams({ term: query, entity: 'song', country: 'BR', limit: '8' });
  try {
    const response = await fetch(`${ITUNES_BASE_URL}?${params}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.results)) return [];
    return data.results.filter(item => item?.trackName).map(item => ({
      title: clean(item.trackName),
      artist: clean(item.artistName),
      album: clean(item.collectionName),
      source: 'iTunes'
    }));
  } catch {
    return [];
  }
}

export async function searchDeezerTrack(query) {
  const params = new URLSearchParams({ q: query, limit: '8' });
  try {
    const response = await fetch(`${DEEZER_BASE_URL}?${params}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.data)) return [];
    return data.data.filter(item => item?.title).map(item => ({
      title: clean(item.title),
      artist: clean(item.artist?.name),
      album: clean(item.album?.title),
      source: 'Deezer'
    }));
  } catch {
    return [];
  }
}

async function identifyTrack(query) {
  const [youtube, itunes, deezer] = await Promise.all([
    searchYouTubeTrack(query).catch(error => {
      if (error?.code === 'YOUTUBE_QUOTA_EXCEEDED') throw error;
      return null;
    }),
    searchITunesTrack(query),
    searchDeezerTrack(query)
  ]);

  const candidates = [
    ...(youtube ? [youtube] : []),
    ...itunes,
    ...deezer
  ].map(candidate => ({
    candidate,
    score: scoreText(query, candidate.title, candidate.artist)
  })).sort((a, b) => b.score - a.score);

  return candidates[0]?.candidate || null;
}

async function searchFmaTrack(query) {
  const apiKey = getFmaKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    limit: '25'
  });

  const response = await fetch(`${FMA_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data.dataset)) return null;

  const candidates = data.dataset
    .filter(track => track?.track_file && track?.track_title)
    .filter(track => {
      const license = normalize(track?.track_license || track?.license || '');
      return !license.includes('noncommercial') || license.includes('attribution');
    })
    .map(track => ({
      track,
      score: scoreText(query, track.track_title, track.artist_name)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best || best.score < 5000) return null;

  const track = best.track;
  const file = clean(track.track_file);
  const audioUrl = file.startsWith('http')
    ? file
    : `https://files.freemusicarchive.org/${file.replace(/^\/+/, '')}`;

  return {
    name: clean(track.track_title),
    artist_name: clean(track.artist_name),
    duration: Number(track.track_duration || track.duration || 0),
    audiodownload: audioUrl,
    source: 'Free Music Archive',
    license: clean(track.track_license || track.license),
    url: clean(track.track_url || track.url)
  };
}

async function searchJamendoTrack(query) {
  const clientId = getJamendoClientId();
  if (!clientId) return null;

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
  if (!response.ok || data?.headers?.status !== 'success') return null;

  const candidates = (Array.isArray(data.results) ? data.results : [])
    .filter(track => track?.audiodownload_allowed && track?.audiodownload)
    .map(track => ({
      track,
      score: scoreText(query, track.name, track.artist_name)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best || best.score < 5000) return null;
  return { ...best.track, source: 'Jamendo' };
}

export async function searchPlayableTrack(query) {
  const identified = await identifyTrack(query);
  const searchQuery = identified?.artist
    ? `${identified.title} ${identified.artist}`
    : (identified?.title || query);

  // Prioridade: FMA. Jamendo fica como fallback opcional.
  const fma = await searchFmaTrack(searchQuery);
  if (fma) return fma;

  return searchJamendoTrack(searchQuery);
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
