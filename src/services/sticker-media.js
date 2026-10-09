import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
export const MAX_STICKER_VIDEO_SECONDS = 10;
export const MAX_STICKER_MEDIA_BYTES = 25 * 1024 * 1024;

export async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function unwrapMessageContent(content) {
  let value = content;
  for (let i = 0; i < 5 && value; i++) {
    if (value.ephemeralMessage?.message) value = value.ephemeralMessage.message;
    else if (value.viewOnceMessage?.message) value = value.viewOnceMessage.message;
    else if (value.viewOnceMessageV2?.message) value = value.viewOnceMessageV2.message;
    else if (value.documentWithCaptionMessage?.message) value = value.documentWithCaptionMessage.message;
    else break;
  }
  return value;
}

function detectMedia(content) {
  if (content?.stickerMessage) return { media: content.stickerMessage, type: 'sticker' };
  if (content?.imageMessage) return { media: content.imageMessage, type: 'image' };
  if (content?.videoMessage) return { media: content.videoMessage, type: 'video' };
  return null;
}

export function getStickerMedia(message) {
  const current = unwrapMessageContent(message?.message);
  const direct = detectMedia(current);
  if (direct) return direct;

  const quoted = unwrapMessageContent(current?.extendedTextMessage?.contextInfo?.quotedMessage);
  return detectMedia(quoted);
}

async function videoToAnimatedWebp(input) {
  if (!ffmpegPath) throw new Error('FFmpeg não está disponível para converter o vídeo.');

  const dir = await mkdtemp(join(tmpdir(), 'togi-sticker-'));
  const inputPath = join(dir, 'input');
  const outputPath = join(dir, 'output.webp');

  try {
    await writeFile(inputPath, input);
    await execFileAsync(ffmpegPath, [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', inputPath,
      '-t', String(MAX_STICKER_VIDEO_SECONDS),
      '-vf', 'fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0',
      '-an',
      '-c:v', 'libwebp',
      '-q:v', '70',
      '-compression_level', '4',
      '-loop', '0',
      '-preset', 'default',
      outputPath
    ], { maxBuffer: 4 * 1024 * 1024 });

    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function imageToWebp(input, animated = false) {
  const image = sharp(input, animated ? { animated: true } : undefined)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });

  return image.webp({ quality: animated ? 75 : 82 }).toBuffer();
}

export async function mediaToStickerWebp(source) {
  if (!source?.media || !source?.type) throw new Error('Mídia inválida para figurinha.');

  if (source.media.seconds && Number(source.media.seconds) > MAX_STICKER_VIDEO_SECONDS) {
    throw new Error(`A mídia animada pode ter no máximo ${MAX_STICKER_VIDEO_SECONDS} segundos.`);
  }

  const stream = await downloadContentFromMessage(source.media, source.type);
  const input = await streamToBuffer(stream);
  if (!input.length) throw new Error('A mídia recebida está vazia.');
  if (input.length > MAX_STICKER_MEDIA_BYTES) throw new Error('A mídia excede o limite de 25 MB.');

  if (source.type === 'sticker') return input;
  if (source.type === 'video') return videoToAnimatedWebp(input);

  const isGif = String(source.media.mimetype || '').toLowerCase() === 'image/gif';
  return imageToWebp(input, isGif);
}

export async function stickerCoverWebp(input) {
  return sharp(input, { animated: false })
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 86 })
    .toBuffer();
}
