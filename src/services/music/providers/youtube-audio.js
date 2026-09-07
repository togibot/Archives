import fs from 'node:fs/promises';
import path from 'node:path';
import ytdl from '@distube/ytdl-core';

const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);
const CACHE_DIR = path.resolve(process.env.MUSIC_CACHE_DIR || './data/music-cache');
const CACHE_TTL = Number(process.env.MUSIC_CACHE_TTL || 6 * 60 * 60 * 1000);

function cacheFile(videoId) {
  return path.join(CACHE_DIR, `${videoId}.bin`);
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

function collectStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    stream.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_AUDIO_BYTES) {
        stream.destroy(new Error('O áudio excede o limite permitido pelo Togi.'));
        return;
      }
      chunks.push(chunk);
    });
    stream.once('end', () => resolve(Buffer.concat(chunks)));
    stream.once('error', reject);
  });
}

export async function downloadYouTubeAudio(video) {
  const url = String(video?.url || '').trim();
  const videoId = String(video?.videoId || '').trim();

  if (!url || !ytdl.validateURL(url)) {
    throw new Error('URL do YouTube inválida.');
  }

  if (videoId) {
    const cached = await readCache(videoId);
    if (cached) {
      return { buffer: cached, mimeType: 'audio/webm', extension: 'webm', cached: true };
    }
  }

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: format => Boolean(format?.url && format.hasAudio && !format.hasVideo)
      });

      if (!format?.url) throw new Error('Nenhum formato de áudio disponível.');

      const size = Number(format.contentLength || 0);
      if (size > MAX_AUDIO_BYTES) {
        throw new Error('O áudio excede o limite permitido pelo Togi.');
      }

      const stream = ytdl.downloadFromInfo(info, {
        format,
        highWaterMark: 1 << 20
      });
      const buffer = await collectStream(stream);
      if (!buffer.length) throw new Error('O áudio retornado está vazio.');

      if (videoId) await writeCache(videoId, buffer);

      return {
        buffer,
        mimeType: format.mimeType?.split(';')[0] || 'audio/webm',
        extension: format.container || 'webm',
        cached: false
      };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw lastError || new Error('Não foi possível obter o áudio.');
}
