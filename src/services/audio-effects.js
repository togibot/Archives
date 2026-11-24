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


function makeImpulseResponse(decaySeconds) {
  const sampleRate = 44100;
  const frames = Math.ceil((decaySeconds + 0.12) * sampleRate);
  const wav = Buffer.alloc(44 + frames * 4);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(frames * 4, 40);
  let seed = 0x6d2b79f5;
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) / 0xffffffff) * 2 - 1;
  };
  const reflections = [
    [0.017, 0.25, -1], [0.031, 0.19, 1], [0.047, 0.14, -1],
    [0.073, 0.11, 1], [0.101, 0.085, -1], [0.137, 0.065, 1],
    [0.181, 0.048, -1], [0.229, 0.035, 1]
  ].map(([seconds, gain, side]) => ({ sample: Math.round(seconds * sampleRate), gain, side }));
  let smoothLeft = 0;
  let smoothRight = 0;
  for (let i = 0; i < frames; i++) {
    const seconds = i / sampleRate;
    const envelope = Math.exp(-6.2 * seconds / decaySeconds);
    smoothLeft = smoothLeft * 0.78 + random() * 0.22;
    smoothRight = smoothRight * 0.78 + random() * 0.22;
    let left = i === 0 ? 0.78 : smoothLeft * 0.11 * envelope;
    let right = i === 0 ? 0.78 : smoothRight * 0.11 * envelope;
    for (const reflection of reflections) {
      if (i === reflection.sample) {
        if (reflection.side < 0) left += reflection.gain;
        else right += reflection.gain;
      }
    }
    const offset = 44 + i * 4;
    wav.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left * 32767))), offset);
    wav.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right * 32767))), offset + 2);
  }
  return wav;
}

async function writeImpulseResponse(path, decaySeconds) {
  await writeFile(path, makeImpulseResponse(decaySeconds));
}

async function runExternal(command, args, timeoutMs = 15 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        OMP_NUM_THREADS: process.env.OMP_NUM_THREADS || "2",
        OPENBLAS_NUM_THREADS: process.env.OPENBLAS_NUM_THREADS || "1"
      }
    });
    const errors = [];
    let errorBytes = 0;
    let settled = false;
    let timer;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      fn(value);
    };
    child.stderr.on("data", chunk => {
      if (errorBytes >= 12000) return;
      errors.push(chunk);
      errorBytes += chunk.length;
    });
    child.once("error", error => finish(reject, error));
    timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish(reject, new Error("A separação vocal excedeu o tempo limite. Tente uma música mais curta."));
    }, timeoutMs);
    timer.unref?.();
    child.once("close", code => {
      const detail = Buffer.concat(errors).toString().trim();
      if (code === 0) return finish(resolve);
      finish(reject, new Error(
        "O separador vocal falhou (" + code + "). " +
        (detail.slice(-1400) || "Verifique a instalação do motor de áudio.")
      ));
    });
  });
}

async function applyConvolutionReverb(inputPath, outputPath, dir, settings) {
  const impulsePath = join(dir, "togi-room-ir.wav");
  await writeImpulseResponse(impulsePath, settings.decaySeconds);
  const graph =
    "[0:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[src];" +
    "[1:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[ir];" +
    "[src][ir]afir=dry=1.0:wet=" + settings.wet +
    ":irfmt=input:irnorm=1,alimiter=limit=0.95,apad=pad_dur=" +
    settings.tailSeconds + "[out]";
  await runFfmpeg([
    "-y", "-i", inputPath, "-i", impulsePath,
    "-filter_complex", graph, "-map", "[out]", "-vn",
    "-ar", "44100", "-ac", "2", "-c:a", "libmp3lame",
    "-b:a", "128k", "-f", "mp3", outputPath
  ]);
}

export async function processOnlyReverb(buffer, mode) {
  if (!["normal", "ultra"].includes(mode)) throw new Error("Escolha o modo normal ou ultra.");
  const dir = await mkdtemp(join(tmpdir(), "togi-only-reverb-"));
  const inputPath = join(dir, "source-audio");
  const stemsDir = join(dir, "stems");
  const vocalPath = join(stemsDir, "vocals.wav");
  const outputPath = join(dir, "only-reverb.mp3");
  const pythonPath = process.env.TOGI_AUDIO_PYTHON
    || join(process.cwd(), ".venv-audio", "bin", "python");
  const scriptPath = join(process.cwd(), "scripts", "only-reverb-separate.py");
  try {
    await writeFile(inputPath, buffer);
    if (!process.env.TOGI_AUDIO_PYTHON) {
      await stat(pythonPath).catch(() => {
        throw new Error("O motor Only Reverb não está instalado. Execute uma vez: bash scripts/setup-audio-ai.sh");
      });
    }
    await runExternal(pythonPath, [scriptPath, mode, inputPath, stemsDir]);
    const vocalStat = await stat(vocalPath).catch(() => null);
    if (!vocalStat?.size) throw new Error("A IA não gerou a faixa vocal esperada.");
    if (vocalStat.size > MAX_INPUT_BYTES) throw new Error("A faixa vocal excedeu o limite de processamento.");
    const settings = mode === "ultra"
      ? { decaySeconds: 3.0, wet: 0.66, tailSeconds: 3.2 }
      : { decaySeconds: 2.1, wet: 0.53, tailSeconds: 2.3 };
    await applyConvolutionReverb(vocalPath, outputPath, dir, settings);
    const outputStat = await stat(outputPath);
    if (!outputStat.size || outputStat.size > MAX_OUTPUT_BYTES) {
      throw new Error("O resultado processado está vazio ou excedeu o limite permitido.");
    }
    return {
      buffer: await readFile(outputPath),
      mimeType: "audio/mpeg",
      extension: "mp3",
      label: mode === "ultra" ? "Only Reverb Ultra" : "Only Reverb Normal"
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
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
  let convolutionLevel = null;
  if (operation === 'reverb') {
    convolutionLevel = Math.max(1, Math.min(10, Number(amount) || 5));
    audioFilter = null;
  }
  if (operation === 'ultrareverb') {
    convolutionLevel = 9;
    audioFilter = null;
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

    if (convolutionLevel !== null) {
      const decaySeconds = 0.65 + convolutionLevel * 0.22;
      const wet = (0.18 + convolutionLevel * 0.037).toFixed(3);
      await applyConvolutionReverb(inputPath, outputPath, dir, {
        decaySeconds,
        wet,
        tailSeconds: (decaySeconds + 0.25).toFixed(2)
      });
    } else {
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
    }

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
