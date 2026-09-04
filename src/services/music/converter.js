const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);

export function prepareAudio(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('O áudio retornado está vazio.');
  if (buffer.length > MAX_AUDIO_BYTES) throw new Error('O áudio excede o limite permitido pelo Togi.');
  return buffer;
}

export function getAudioPayload(buffer, track) {
  return {
    audio: prepareAudio(buffer),
    mimetype: 'audio/mpeg',
    fileName: getAudioFileName(track),
    ptt: false
  };
}

export function getAudioFileName(track) {
  const title = String(track?.name || 'togi-audio').replace(/\s+/g, ' ').trim();
  const artist = String(track?.artist_name || '').replace(/\s+/g, ' ').trim();
  const base = artist ? `${title} - ${artist}` : title;
  return `${base.replace(/[\\/:*?"<>|]/g, '').slice(0, 100)}.mp3`;
}
