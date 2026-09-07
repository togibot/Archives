const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);

export function prepareAudio(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('O áudio retornado está vazio.');
  if (buffer.length > MAX_AUDIO_BYTES) throw new Error('O áudio excede o limite permitido pelo Togi.');
  return buffer;
}

export function getAudioPayload(audio, track) {
  const buffer = Buffer.isBuffer(audio) ? audio : audio?.buffer;
  const mimeType = audio?.mimeType || track?.mimeType || 'audio/mpeg';
  const extension = audio?.extension || track?.extension || 'mp3';

  return {
    audio: prepareAudio(buffer),
    mimetype: mimeType,
    fileName: getAudioFileName(track, extension),
    ptt: false
  };
}

export function getAudioFileName(track, extension = 'mp3') {
  const title = String(track?.name || track?.title || 'togi-audio').replace(/\s+/g, ' ').trim();
  const artist = String(track?.artist_name || track?.artist || '').replace(/\s+/g, ' ').trim();
  const base = artist ? `${title} - ${artist}` : title;
  const safeExtension = String(extension || 'mp3').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'mp3';
  return `${base.replace(/[\\/:*?"<>|]/g, '').slice(0, 100)}.${safeExtension}`;
}
