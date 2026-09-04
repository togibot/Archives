import { searchArchive } from './archive.js';

const FMA_BASE_URL = 'https://freemusicarchive.org/api/get/tracks.json';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const MAX_RESULTS = 25;

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(value) { return normalize(value).split(/\s+/).filter(Boolean); }

function score(query, title, artist = '') {
  const q = normalize(query);
  const qTokens = tokens(query);
  const t = normalize(title);
  const a = normalize(artist);
  if (!q || !t) return 0;
  let points = t === q ? 100000 : t.includes(q) ? 30000 : 0;
  const titleTokens = new Set(tokens(title));
  const artistTokens = new Set(tokens(artist));
  let matched = 0;
  for (const token of qTokens) {
    if (titleTokens.has(token)) { points += 7000; matched++; }
    else if (artistTokens.has(token)) { points += 4000; matched++; }
  }
  if (qTokens.length) points += (matched / qTokens.length) * 15000;
  if (matched < qTokens.length && qTokens.length >= 2) points *= matched / qTokens.length;
  return points;
}

function getFmaKey() { return clean(process.env.FMA_KEY || process.env.FMA_API_KEY); }
function getJamendoClientId() { return clean(process.env.JAMENDO_CLIENT_ID); }

function fmaLicenseAllowed(track) {
  const license = normalize(track?.track_license || track?.license || '');
  if (!license || license.includes('noncommercial') || license.includes('no derivatives') || license.includes(' nd')) return false;
  return license.includes('public domain') || license.includes('cc by') || license.includes('cc by sa') || license.includes('attribution');
}

async function searchFma(query) {
  const apiKey = getFmaKey();
  if (!apiKey) return null;
  const params = new URLSearchParams({ api_key: apiKey, q: query, limit: String(MAX_RESULTS) });
  const response = await fetch(`${FMA_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data.dataset)) return null;
  const candidates = data.dataset.filter(track => track?.track_file && track?.track_title).filter(fmaLicenseAllowed)
    .map(track => ({ track, score: score(query, track.track_title, track.artist_name) }))
    .filter(item => item.score >= 5000).sort((a, b) => b.score - a.score);
  const best = candidates[0]?.track;
  if (!best) return null;
  const file = clean(best.track_file);
  return {
    name: clean(best.track_title), artist_name: clean(best.artist_name) || 'Artista desconhecido',
    duration: Number(best.track_duration || best.duration || 0),
    audiodownload: file.startsWith('http') ? file : `https://files.freemusicarchive.org/${file.replace(/^\/+/, '')}`,
    source: 'Free Music Archive', license: clean(best.track_license || best.license), url: clean(best.track_url || best.url)
  };
}

async function searchJamendo(query) {
  const clientId = getJamendoClientId();
  if (!clientId) return null;
  const params = new URLSearchParams({ client_id: clientId, format: 'json', namesearch: query, type: 'single albumtrack', audioformat: 'mp32', audiodlformat: 'mp32', limit: String(MAX_RESULTS), order: 'relevance' });
  const response = await fetch(`${JAMENDO_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.headers?.status !== 'success') return null;
  const candidates = (Array.isArray(data.results) ? data.results : []).filter(track => track?.audiodownload_allowed && track?.audiodownload)
    .map(track => ({ track, score: score(query, track.name, track.artist_name) }))
    .filter(item => item.score >= 5000).sort((a, b) => b.score - a.score);
  const best = candidates[0]?.track;
  return best ? { ...best, source: 'Jamendo', name: clean(best.name), artist_name: clean(best.artist_name) } : null;
}

export async function searchLicensedTracks(query, originalQuery = query) {
  const [archive, fma, jamendo] = await Promise.all([
    searchArchive(query).catch(() => null),
    searchFma(query).catch(() => null),
    searchJamendo(query).catch(() => null)
  ]);

  const candidates = [archive, fma, jamendo].filter(Boolean).map(track => ({
    track,
    score: Math.max(score(originalQuery, track.name || track.track_title, track.artist_name), score(query, track.name || track.track_title, track.artist_name))
  })).sort((a, b) => b.score - a.score);

  return candidates[0]?.track || null;
}
