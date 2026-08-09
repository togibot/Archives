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
  return new Set(normalize(value).split(/\s+/).filter(Boolean));
}

function relevanceScore(query, track) {
  const queryText = normalize(query);
  const queryTokens = tokenize(query);
  const title = normalize(track?.name);
  const artist = normalize(track?.artist_name);
  const combined = `${title} ${artist}`;
  const titleTokens = tokenize(track?.name);
  const artistTokens = tokenize(track?.artist_name);

  let score = 0;

  if (title === queryText) score += 1000;
  if (title.includes(queryText)) score += 450;
  if (artist === queryText) score += 250;
  if (combined.includes(queryText)) score += 150;

  for (const token of queryTokens) {
    if (titleTokens.has(token)) score += 100;
    else if (artistTokens.has(token)) score += 70;
    else if (combined.includes(token)) score += 20;
  }

  // Penaliza resultados que só coincidem fracamente com a pesquisa.
  if (queryTokens.size > 0) {
    const matched = [...queryTokens].filter(token => combined.includes(token)).length;
    score += (matched / queryTokens.size) * 150;
  }

  return score;
}

function popularityScore(track) {
  const popularity = Number(track?.popularity) || 0;
  const rating = Number(track?.rating) || 0;
  const likes = Number(track?.likes) || 0;
  const playcount = Number(track?.playcount) || 0;
  const downloads = Number(track?.downloads) || 0;

  // Popularidade do catálogo tem prioridade, com sinais extras como desempate.
  return (popularity * 100) + (rating * 10) + Math.log10(1 + likes) * 4 + Math.log10(1 + playcount) * 3 + Math.log10(1 + downloads) * 2;
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
    order: 'relevance'
  });

  const response = await fetch(`${JAMENDO_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.headers?.status !== 'success') {
    throw new Error(data?.headers?.error_message || `Jamendo HTTP ${response.status}`);
  }

  const tracks = (Array.isArray(data.results) ? data.results : [])
    .filter(track => track?.audiodownload_allowed && track?.audiodownload)
    .map(track => ({
      track,
      relevance: relevanceScore(query, track),
      popularity: popularityScore(track)
    }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => {
      // Primeiro garantimos que a música realmente corresponde ao pedido;
      // depois usamos popularidade para escolher a melhor entre as correspondentes.
      const scoreA = a.relevance * 10 + a.popularity;
      const scoreB = b.relevance * 10 + b.popularity;
      return scoreB - scoreA;
    });

  return tracks[0]?.track || null;
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
