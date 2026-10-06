import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MAX_INPUT_BYTES = Number(process.env.AUDIO_MAX_INPUT_BYTES || 25 * 1024 * 1024);
const MAX_OUTPUT_BYTES = Number(process.env.MUSIC_MAX_BYTES || 20 * 1024 * 1024);

function unwrap(content) {
  let value = content;
  for (let i = 0; i < 6 && value; i++) {
    if (value.ephemeralMessage?.message) value = value.ephemeralMessage.message;
    else if (value.viewOnceMessage?.message) value = value.viewOnceMessage.message;
    else if (value.viewOnceMessageV2?.message) value = value.viewOnceMessageV2.message;
    else break;
  }
  return value;
}

function contextInfo(messageContent) {
  return messageContent?.extendedTextMessage?.contextInfo
    || messageContent?.imageMessage?.contextInfo
    || messageContent?.videoMessage?.contextInfo
    || messageContent?.audioMessage?.contextInfo
    || messageContent?.documentMessage?.contextInfo
    || null;
}

function detectMedia(content) {
  const value = unwrap(content);
  if (!value) return null;

  if (value.audioMessage) return { media: value.audioMessage, type: 'audio' };
  if (value.videoMessage) return { media: value.videoMessage, type: 'video' };

  if (value.documentMessage) {
    const mimetype = String(value.documentMessage.mimetype || '').toLowerCase();
    if (mimetype.startsWith('audio/')) return { media: value.documentMessage, type: 'document' };
    if (mimetype.startsWith('video/')) return { media: value.documentMessage, type: 'document' };
  }

  const quoted = contextInfo(value)?.quotedMessage;
  return quoted ? detectMedia(quoted) : null;
}

export function getAudioTarget(message) {
  return detectMedia(message?.message);
}

async function streamToBuffer(stream) {
  const chunks = [];
  let total = 0;

  for await (const chunk of stream) {
    total += chunk.length;
    if (total > MAX_INPUT_BYTES) {
      throw new Error(`A mídia excede o limite de ${Math.floor(MAX_INPUT_BYTES / 1024 / 1024)} MB.`);
    }
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  if (!buffer.length) throw new Error('A mídia recebida está vazia.');
  return buffer;
}

export async function downloadAudioTarget(target) {
  if (!target?.media || !target?.type) {
    throw new Error('Envie um áudio ou responda a um áudio para usar este comando.');
  }

  const stream = await downloadContentFromMessage(target.media, target.type);
  return streamToBuffer(stream);
}

function runFfmpeg(args) {
  if (!ffmpegPath) throw new Error('FFmpeg não está disponível no servidor.');

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-nostdin', ...args]);
    const errors = [];

    child.stderr.on('data', chunk => errors.push(chunk));
    child.once('error', reject);
    child.once('close', code => {
      if (code === 0) return resolve();
      const detail = Buffer.concat(errors).toString().trim().slice(0, 700);
      reject(new Error(`FFmpeg falhou (${code}).${detail ? ` ${detail}` : ''}`));
    });
  });
}

function pitchFactor(semitones) {
  return Math.pow(2, Number(semitones) / 12);
}

const OPERATIONS = {
  slowed: {
    label: 'Slowed',
    filter: 'asetrate=35280,aresample=44100'
  },
  speedup: {
    label: 'Speed Up',
    filter: 'asetrate=66150,aresample=44100'
  },
  speedmusic: {
    label: 'Speed Music',
    filter: 'atempo=1.5'
  },
  slowmusic: {
    label: 'Slow Music',
    filter: 'atempo=0.8'
  },
  highpitch: {
    label: 'High Pitch',
    filter: (() => {
      const factor = pitchFactor(4);
      return `asetrate=${Math.round(44100 * factor)},aresample=44100,atempo=${(1 / factor).toFixed(6)}`;
    })()
  },
  lowpitch: {
    label: 'Low Pitch',
    filter: (() => {
      const factor = pitchFactor(-4);
      return `asetrate=${Math.round(44100 * factor)},aresample=44100,atempo=${(1 / factor).toFixed(6)}`;
    })()
  },
  tomp3: {
    label: 'MP3',
    filter: null
  },
  reverb: {
    label: 'Reverb',
    filter: null
  }
};

export async function processAudio(buffer, operation, amount = 5) {
  const config = OPERATIONS[operation];
  if (!config) throw new Error('Efeito de áudio inválido.');

  if (operation === 'reverb') {
    const level = Math.max(1, Math.min(10, Number(amount) || 5));
    const delay = Math.round(60 + level * 32);
    const decay = (0.10 + level * 0.065).toFixed(3);
    config.filter = `aecho=0.82:0.90:${delay}:${decay}`;
  }

  const dir = await mkdtemp(join(tmpdir(), 'togi-audio-'));
  const inputPath = join(dir, 'input');
  const outputPath = join(dir, 'output.mp3');

  try {
    await writeFile(inputPath, buffer);

    const args = ['-y', '-i', inputPath, '-vn'];
    if (config.filter) args.push('-filter:a', config.filter);
    args.push(
      '-ar', '44100',
      '-ac', '2',
      '-c:a', 'libmp3lame',
      '-b:a', '128k',
      '-f', 'mp3',
      outputPath
    );

    await runFfmpeg(args);

    const outputStat = await stat(outputPath);
    if (!outputStat.size) throw new Error('O FFmpeg gerou um arquivo vazio.');
    if (outputStat.size > MAX_OUTPUT_BYTES) {
      throw new Error('O áudio processado excedeu o limite permitido pelo Togi.');
    }

    return {
      buffer: await readFile(outputPath),
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      label: config.label
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
