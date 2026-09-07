import ytdl from '@distube/ytdl-core';

const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);

export async function downloadYouTubeAudio(video) {
  const url = String(video?.url || '').trim();
  if (!url || !ytdl.validateURL(url)) {
    throw new Error('URL do YouTube inválida.');
  }

  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highestaudio',
    filter: 'audioonly'
  });

  if (!format?.url) throw new Error('Nenhum formato de áudio disponível.');
  if (Number(format.contentLength || 0) > MAX_AUDIO_BYTES) {
    throw new Error('O áudio excede o limite permitido pelo Togi.');
  }

  const response = await fetch(format.url);
  if (!response.ok) throw new Error(`Falha ao obter o áudio (HTTP ${response.status}).`);

  const contentLength = Number(response.headers.get('content-length') || format.contentLength || 0);
  if (contentLength > MAX_AUDIO_BYTES) {
    throw new Error('O áudio excede o limite permitido pelo Togi.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error('O áudio retornado está vazio.');
  if (buffer.length > MAX_AUDIO_BYTES) throw new Error('O áudio excede o limite permitido pelo Togi.');

  return {
    buffer,
    mimeType: format.mimeType?.split(';')[0] || 'audio/webm',
    extension: format.container || 'webm'
  };
}
