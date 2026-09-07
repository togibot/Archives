import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import YTdownload from '@hoangquyet/ytdown';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';

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
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cacheFile(videoId), buffer);
  } catch (error) {
    console.error('[TOGI MUSIC CACHE]', error);
  }
}

function resolveVideoUrl(video) {
  const url = String(video?.url || '').trim();
  if (url) return url;

  const videoId = String(video?.videoId || '').trim();
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;

  throw new Error('URL do vídeo do YouTube inválida.');
}

async function transcodeToMp3(inputPath) {
  if (!ffmpegPath) throw new Error('FFmpeg não foi encontrado.');

  const outputPath = path.join(
    os.tmpdir(),
    `togi-${Date.now()}-${Math.random().toString(16).slice(2)}.mp3`
  );

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      inputPath,
      '-vn',
      '-ac',
      '2',
      '-ar',
      '44100',
      '-b:a',
      '128k',
      '-f',
      'mp3',
      outputPath
    ]);

    const errors = [];
    ffmpeg.stderr.on('data', chunk => errors.push(chunk));
    ffmpeg.once('error', reject);
    ffmpeg.once('close', code => {
      if (code !== 0) {
        return reject(new Error(
          `FFmpeg falhou (${code}): ${Buffer.concat(errors).toString().slice(0, 500)}`
        ));
      }
      resolve();
    });
  });

  try {
    const buffer = await fs.readFile(outputPath);
    if (!buffer.length) throw new Error('FFmpeg gerou áudio vazio.');
    if (buffer.length > MAX_AUDIO_BYTES) {
      throw new Error('Áudio convertido excedeu o limite permitido pelo Togi.');
    }
    return buffer;
  } finally {
    await fs.rm(outputPath, { force: true }).catch(() => {});
  }
}

async function downloadRawAudio(videoUrl) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'togi-ytdown-'));
  const inputPath = path.join(tempDir, 'audio');

  try {
    const result = await YTdownload.down(videoUrl, {
      audioOnly: true,
      output: inputPath
    });

    const candidates = [
      result?.path,
      result?.filePath,
      inputPath,
      `${inputPath}.m4a`,
      `${inputPath}.webm`,
      `${inputPath}.mp3`,
      `${inputPath}.opus`
    ].filter(Boolean);

    for (const candidate of candidates) {
      try {
        const stat = await fs.stat(candidate);
        if (stat.isFile() && stat.size > 0) return candidate;
      } catch {}
    }

    throw new Error('O downloader não gerou um arquivo de áudio utilizável.');
  } catch (error) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw new Error(`Falha no download do YouTube: ${error?.message || error}`);
  }
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

  const videoUrl = resolveVideoUrl(video);
  const inputPath = await downloadRawAudio(videoUrl);
  const tempDir = path.dirname(inputPath);

  try {
    const buffer = await transcodeToMp3(inputPath);
    await writeCache(videoId, buffer);

    return {
      buffer,
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      cached: false
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
