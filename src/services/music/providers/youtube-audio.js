import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import ytdl from '@distube/ytdl-core';

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

function collectStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;

    const fail = error => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    stream.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_AUDIO_BYTES * 2) {
        stream.destroy(new Error('Áudio bruto excedeu o limite.'));
        return;
      }
      chunks.push(chunk);
    });
    stream.once('end', () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks));
    });
    stream.once('error', fail);
  });
}

function convertToMp3(input) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error('FFmpeg não foi encontrado.'));

    const output = path.join(os.tmpdir(), `togi-${Date.now()}-${Math.random().toString(16).slice(2)}.mp3`);
    const ffmpeg = spawn(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error',
      '-i', 'pipe:0',
      '-vn', '-ac', '2', '-ar', '44100',
      '-b:a', '128k',
      '-f', 'mp3', output
    ]);

    const errors = [];
    ffmpeg.stderr.on('data', chunk => errors.push(chunk));
    ffmpeg.once('error', reject);
    ffmpeg.once('close', async code => {
      if (code !== 0) {
        await fs.rm(output, { force: true }).catch(() => {});
        return reject(new Error(`FFmpeg falhou (${code}): ${Buffer.concat(errors).toString().slice(0, 500)}`));
      }
      try {
        const buffer = await fs.readFile(output);
        await fs.rm(output, { force: true });
        if (!buffer.length) return reject(new Error('FFmpeg gerou áudio vazio.'));
        if (buffer.length > MAX_AUDIO_BYTES) return reject(new Error('Áudio convertido excedeu o limite.'));
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

export async function downloadYouTubeAudio(video) {
  const url = String(video?.url || '').trim();
  const videoId = String(video?.videoId || '').trim();
  if (!url || !ytdl.validateURL(url)) throw new Error('URL do YouTube inválida.');

  if (videoId) {
    const cached = await readCache(videoId);
    if (cached) return { buffer: cached, mimeType: 'audio/mpeg', extension: 'mp3', cached: true };
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

      const stream = ytdl.downloadFromInfo(info, { format, highWaterMark: 1 << 20 });
      const raw = await collectStream(stream);
      if (!raw.length) throw new Error('O áudio retornado está vazio.');

      const buffer = await convertToMp3(raw);
      if (videoId) await writeCache(videoId, buffer);
      return { buffer, mimeType: 'audio/mpeg', extension: 'mp3', cached: false };
    } catch (error) {
      lastError = error;
      console.error(`[TOGI MUSIC DOWNLOAD] tentativa ${attempt}:`, error?.message || error);
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 700));
    }
  }

  throw lastError || new Error('Não foi possível obter o áudio.');
}
