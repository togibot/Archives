import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { applyStickerMetadata, getDefaultStickerName } from '../../services/stickers.js';
import { getUser } from '../../database/index.js';

const execFileAsync = promisify(execFile);
const MAX_VIDEO_SECONDS = 10;
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function unwrap(content) {
  let value = content;
  for (let i = 0; i < 5 && value; i++) {
    if (value.ephemeralMessage?.message) value = value.ephemeralMessage.message;
    else if (value.viewOnceMessage?.message) value = value.viewOnceMessage.message;
    else if (value.viewOnceMessageV2?.message) value = value.viewOnceMessageV2.message;
    else break;
  }
  return value;
}

function getMediaMessage(message) {
  const current = unwrap(message.message);
  if (current?.imageMessage) return current.imageMessage;
  if (current?.videoMessage) return current.videoMessage;

  const context = current?.extendedTextMessage?.contextInfo;
  const quoted = unwrap(context?.quotedMessage);
  if (quoted?.imageMessage) return quoted.imageMessage;
  if (quoted?.videoMessage) return quoted.videoMessage;
  return null;
}

function requesterName(message) {
  return message?.pushName || message?.key?.participant?.split('@')[0] || 'Usuário';
}

function groupName(chat, message) {
  return chat?.endsWith?.('@g.us') ? (message?.groupMetadata?.subject || 'Grupo') : 'Privado';
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
      '-t', String(MAX_VIDEO_SECONDS),
      '-vf', 'fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0',
      '-an',
      '-c:v', 'libwebp',
      '-q:v', '70',
      '-compression_level', '4',
      '-loop', '0',
      '-preset', 'default',
      outputPath
    ], { maxBuffer: 1024 * 1024 * 4 });

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

export default {
  name: 'sticker',
  aliases: ['s', 'fig'],
  category: 'sticker',
  description: 'Transforma imagem, vídeo ou GIF curto em figurinha.',
  async execute({ sock, chat, message, reply }) {
    const media = getMediaMessage(message);
    if (!media) {
      return reply('🖼️ Envie/responda a uma imagem, vídeo ou GIF curto usando *.s* ou *.sticker*.');
    }

    if (media.seconds && Number(media.seconds) > MAX_VIDEO_SECONDS) {
      return reply(`🎬 A mídia é muito longa. Use uma imagem ou uma mídia animada de até ${MAX_VIDEO_SECONDS} segundos.`);
    }

    try {
      const type = media.mimetype?.startsWith('video/') ? 'video' : 'image';
      const stream = await downloadContentFromMessage(media, type);
      const input = await streamToBuffer(stream);

      if (input.length > MAX_MEDIA_BYTES) {
        return reply('📦 A mídia excede o limite de 25 MB para conversão em FIG.');
      }

      const isGif = String(media.mimetype || '').toLowerCase() === 'image/gif';
      let webp;

      if (type === 'video') {
        // Vídeos e GIFs enviados pelo WhatsApp normalmente chegam como
        // videoMessage. FFmpeg garante a conversão correta para WebP animado.
        webp = await videoToAnimatedWebp(input);
      } else if (isGif) {
        webp = await imageToWebp(input, true);
      } else {
        webp = await imageToWebp(input, false);
      }

      const requester = requesterName(message);
      const userJid = message?.key?.participant || message?.key?.remoteJid || '';
      const name = getUser(userJid)?.sticker_nick?.trim() || getDefaultStickerName();
      const finalWebp = await applyStickerMetadata(
        webp,
        name,
        requester,
        groupName(chat, message)
      );

      await sock.sendMessage(chat, { sticker: finalWebp }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui criar a figurinha.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
