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

export async function searchPlayableTrack(query) {
  const clientId = getClientId();
  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    namesearch: query,
    type: 'single albumtrack',
    audioformat: 'mp32',
    audiodlformat: 'mp32',
    limit: '8',
    order: 'relevance'
  });

  const response = await fetch(`${JAMENDO_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.headers?.status !== 'success') {
    throw new Error(data?.headers?.error_message || `Jamendo HTTP ${response.status}`);
  }

  const tracks = Array.isArray(data.results) ? data.results : [];
  return tracks.find(track => track?.audiodownload_allowed && track?.audiodownload) || null;
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
