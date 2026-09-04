import { resolveMusic } from './resolver.js';
import { getAudioPayload, getAudioFileName, prepareAudio } from './converter.js';

export { resolveMusic, getAudioPayload, getAudioFileName, prepareAudio };

export async function downloadTrack(track) {
  const url = String(track?.audiodownload || '').trim();
  if (!url || !/^https:\/\//i.test(url)) {
    throw new Error('Esta faixa não possui uma fonte de áudio permitida.');
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar o áudio (HTTP ${response.status}).`);

  const maxBytes = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > maxBytes) throw new Error('O áudio excede o limite permitido pelo Togi.');

  return prepareAudio(Buffer.from(await response.arrayBuffer()));
}
