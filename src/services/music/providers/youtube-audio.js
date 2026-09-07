import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { Innertube, UniversalCache } from 'youtubei.js';

const MAX_AUDIO_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);
const CACHE_DIR = path.resolve(process.env.MUSIC_CACHE_DIR || './data/music-cache');
const YOUTUBE_CACHE_DIR = path.resolve(process.env.MUSIC_YOUTUBE_CACHE_DIR || './data/youtube-cache');
const CACHE_TTL = Number(process.env.MUSIC_CACHE_TTL || 6 * 60 * 60 * 1000);

let youtubePromise = null;

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

async function getYouTube() {
  if (!youtubePromise) {
    youtubePromise = Innertube.create({
      lang: 'pt-BR',
      location: 'BR',
      cache: new UniversalCache(true, YOUTUBE_CACHE_DIR)
    }).catch(error => {
      youtubePromise = null;
      throw error;
    });
  }
  return youtubePromise;
}

async function fetchAudioUrl(url) {
  if (!url || !/^https:\/\//i.test(url)) {
    throw new Error('O YouTube não retornou uma URL de áudio válida.');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao obter o áudio do YouTube (HTTP ${response.status}).`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_AUDIO_BYTES * 2) {
    throw new Error('O áudio bruto excede o limite permitido pelo Togi.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error('O YouTube retornou áudio vazio.');
  if (buffer.length > MAX_AUDIO_BYTES * 2) {
    throw new Error('O áudio bruto excede o limite permitido pelo Togi.');
  }

  return buffer;
}

function convertToMp3(input) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error('FFmpeg não foi encontrado.'));

    const output = path.join(
      os.tmpdir(),
      `togi-${Date.now()}-${Math.random().toString(16).slice(2)}.mp3`
    );

    const ffmpeg = spawn(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      'pipe:0',
      '-vn',
      '-ac',
      '2',
      '-ar',
      '44100',
      '-b:a',
      '128k',
      '-f',
      'mp3',
      output
    ]);

    const errors = [];
    ffmpeg.stderr.on('data', chunk => errors.push(chunk));
    ffmpeg.once('error', reject);

    ffmpeg.once('close', async code => {
      if (code !== 0) {
        await fs.rm(output, { force: true }).catch(() => {});
        return reject(new Error(
          `FFmpeg falhou (${code}): ${Buffer.concat(errors).toString().slice(0, 500)}`
        ));
      }

      try {
        const buffer = await fs.readFile(output);
        await fs.rm(output, { force: true });

        if (!buffer.length) return reject(new Error('FFmpeg gerou áudio vazio.'));
        if (buffer.length > MAX_AUDIO_BYTES) {
          return reject(new Error('Áudio convertido excedeu o limite.'));
        }

        resolve(buffer);
      } catch (error) {
        await fs.rm(output, { force: true }).catch(() => {});
        reject(error);
      }
    });

    ffmpeg.stdin.on('error', () => {});
    ffmpeg.stdin.end(input);
  });
}

async function tryClient(youtube, videoId, client) {
  console.log(`[TOGI MUSIC YOUTUBE.JS] usando cliente ${client}`);

  const info = await youtube.getBasicInfo(videoId, { client });
  if (info.basic_info?.is_live) {
    throw new Error('Transmissões ao vivo não são suportadas pelo .play.');
  }

  const format = info.chooseFormat({
    type: 'audio',
    quality: 'best'
  });

  if (!format?.url) {
    throw new Error(`O cliente ${client} não retornou uma URL direta de áudio.`);
  }

  // Android/iOS podem fornecer uma URL utilizável sem chamar decipher().
  const raw = await fetchAudioUrl(format.url);
  return convertToMp3(raw);
}

export async function downloadYouTubeAudio(video) {
  const videoId = String(video?.videoId || '').trim();
  if (!videoId) throw new Error('ID do vídeo do YouTube inválido.');

  const cached = await readCache(videoId);
  if (cached) {
    return {
      buffer: cached,
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      cached: true
    };
  }

  const youtube = await getYouTube();
  let lastError;

  // Evita os clientes WEB/TV que estão exigindo decipher e falhando no
  // youtubei.js 18.0.0. Android e iOS podem expor URLs diretas de formato.
  for (const client of ['ANDROID', 'IOS']) {
    try {
      const buffer = await tryClient(youtube, videoId, client);
      await writeCache(videoId, buffer);

      return {
        buffer,
        mimeType: 'audio/mpeg',
        extension: 'mp3',
        cached: false
      };
    } catch (error) {
      lastError = error;
      console.error(`[TOGI MUSIC YOUTUBE.JS] ${client}:`, error?.message || error);
    }
  }

  throw lastError || new Error('Não foi possível obter o áudio do YouTube.');
}
