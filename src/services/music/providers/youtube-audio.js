import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import youtubedl from 'youtube-dl-exec';

const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);
const CACHE_DIR = path.resolve(process.env.MUSIC_CACHE_DIR || './data/music-cache');
const CACHE_TTL = Number(process.env.MUSIC_CACHE_TTL || 6 * 60 * 60 * 1000);

function cacheFile(videoId) {
  return path.join(CACHE_DIR, `${videoId}.mp3`);
}

async function readCache(videoId) {
  try {
    const file = cacheFile(videoId);
    const stat = await fs.stat(file);
    if (Date.now() - stat.mtimeMs > CACHE_TTL) return null;
    const buffer = await fs.readFile(file);
    if (!buffer.length || buffer.length > MAX_AUDIO_BYTES) return null;
    return buffer;
  } catch {
    return null;
  }
}

async function writeCache(videoId, buffer) {
  if (!videoId || !Buffer.isBuffer(buffer) || !buffer.length) return;
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cacheFile(videoId), buffer);
  } catch (error) {
    console.error('[TOGI MUSIC CACHE]', error);
  }
}

async function downloadWithYtDlp(url, output) {
  console.log('[TOGI MUSIC YT-DLP] baixando áudio');

  await youtubedl(url, {
    noPlaylist: true,
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: '5',
    output,
    noWarnings: true,
    noCallHome: true,
    preferFreeFormats: true,
    noCheckCertificates: true,
    addHeader: [
      'referer:https://www.youtube.com/',
      'user-agent:Mozilla/5.0'
    ]
  });

  const buffer = await fs.readFile(output);
  if (!buffer.length) throw new Error('O yt-dlp retornou áudio vazio.');
  if (buffer.length > MAX_AUDIO_BYTES) {
    throw new Error('O áudio excede o limite permitido pelo Togi.');
  }

  return buffer;
}

export async function downloadYouTubeAudio(video) {
  const videoId = String(video?.videoId || '').trim();
  const url = String(video?.url || '').trim();

  if (!videoId || !/^https?:\/\//i.test(url)) {
    throw new Error('Vídeo do YouTube inválido.');
  }

  const cached = await readCache(videoId);
  if (cached) {
    console.log('[TOGI MUSIC CACHE] áudio encontrado no cache');
    return {
      buffer: cached,
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      cached: true
    };
  }

  const output = path.join(
    os.tmpdir(),
    `togi-music-${videoId}-${Date.now()}.%(ext)s`
  );

  try {
    const buffer = await downloadWithYtDlp(url, output);
    await writeCache(videoId, buffer);

    return {
      buffer,
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      cached: false
    };
  } catch (error) {
    console.error('[TOGI MUSIC YT-DLP]', error?.message || error);
    throw new Error(`Não foi possível obter o áudio do YouTube: ${error?.message || 'erro desconhecido'}`);
  } finally {
    const directory = path.dirname(output);
    const prefix = path.basename(output).split('.%(ext)s')[0];

    try {
      const files = await fs.readdir(directory);
      await Promise.all(
        files
          .filter(file => file.startsWith(prefix))
          .map(file => fs.rm(path.join(directory, file), { force: true }))
      );
    } catch {
      // Limpeza é best-effort.
    }
  }
}
