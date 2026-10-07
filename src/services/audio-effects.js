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

function runFfmpeg(args, capture = false) {
  if (!ffmpegPath) throw new Error('FFmpeg não está disponível no servidor.');

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-nostdin', ...args]);
    const errors = [];

    child.stderr.on('data', chunk => errors.push(chunk));
    child.once('error', reject);
    child.once('close', code => {
      const detail = Buffer.concat(errors).toString().trim();
      if (code === 0) return resolve(capture ? detail : undefined);
      reject(new Error(`FFmpeg falhou (${code}).${detail ? ` ${detail.slice(0, 700)}` : ''}`));
    });
  });
}

async function analyzeAudio(buffer) {
  const dir = await mkdtemp(join(tmpdir(), 'togi-analyze-'));
  const inputPath = join(dir, 'input');

  try {
    await writeFile(inputPath, buffer);
    const output = await runFfmpeg(
      ['-i', inputPath, '-af', 'volumedetect', '-f', 'null', '-'],
      true
    );

    const meanMatch = output.match(/mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/i);
    const maxMatch = output.match(/max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/i);

    const meanDb = meanMatch ? Number(meanMatch[1]) : -18;
    const maxDb = maxMatch ? Number(maxMatch[1]) : -3;

    return {
      meanDb: Number.isFinite(meanDb) ? meanDb : -18,
      maxDb: Number.isFinite(maxDb) ? maxDb : -3
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
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
  },
  ultrareverb: {
    label: 'Ultra Reverb',
    filter: null
  },
  liquid: {
    label: 'Digital Liquid',
    filter: null
  },
  '8d': {
    label: '8D Audio',
    filter: 'apulsator=mode=sine:amount=0.9:offset_l=0:offset_r=0.5:width=1.8:timing=hz:hz=0.12'
  }
};

export async function processAudio(buffer, operation, amount = 5) {
  const config = OPERATIONS[operation];
  if (!config) throw new Error('Efeito de áudio inválido.');

  let audioFilter = config.filter;
  if (operation === 'reverb') {
    const level = Math.max(1, Math.min(10, Number(amount) || 5));
    const delay = Math.round(60 + level * 32);
    const decay = (0.10 + level * 0.065).toFixed(3);
    audioFilter = `aecho=0.82:0.90:${delay}:${decay}`;
  }

  if (operation === 'ultrareverb') {
    const state = await analyzeAudio(buffer);
    const quiet = state.meanDb < -27;
    const hot = state.maxDb > -1.2;

    const inputGain = quiet ? 0.92 : 0.80;
    const outputGain = hot ? 0.80 : 0.94;
    const delays = quiet ? '78|156|300' : hot ? '105|210|390' : '92|184|345';
    const decays = quiet ? '0.34|0.22|0.12' : hot ? '0.26|0.17|0.09' : '0.31|0.20|0.11';
    const makeup = quiet ? 2 : 1;

    audioFilter =
      `highpass=28,lowpass=18500,` +
      `acompressor=threshold=-18dB:ratio=2.4:attack=20:release=240:makeup=${makeup},` +
      `aecho=${inputGain}:${outputGain}:${delays}:${decays},` +
      `alimiter=limit=0.95`;
  }

  if (operation === 'liquid') {
    const level = Math.max(1, Math.min(10, Number(amount) || 5));
    const chorusDepth = (0.14 + level * 0.035).toFixed(3);
    const flangerDepth = (1.5 + level * 0.45).toFixed(2);
    const flangerWidth = Math.round(30 + level * 5);
    const flangerSpeed = (0.12 + level * 0.045).toFixed(3);
    audioFilter = `chorus=0.72:0.9:55:${chorusDepth}:0.25:2,flanger=delay=8:depth=${flangerDepth}:regen=18:width=${flangerWidth}:speed=${flangerSpeed}:shape=sinusoidal:phase=55:interp=linear`;
  }

  const dir = await mkdtemp(join(tmpdir(), 'togi-audio-'));
  const inputPath = join(dir, 'input');
  const outputPath = join(dir, 'output.mp3');

  try {
    await writeFile(inputPath, buffer);

    const args = ['-y', '-i', inputPath, '-vn'];
    if (audioFilter) args.push('-filter:a', audioFilter);
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
