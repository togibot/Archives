import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import { applyStickerMetadata, getDefaultStickerName } from '../../services/stickers.js';
import { getUser } from '../../database/index.js';

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

export default {
  name: 'sticker',
  aliases: ['s', 'fig'],
  category: 'sticker',
  description: 'Transforma imagem ou vídeo curto em figurinha.',
  async execute({ sock, chat, message, reply }) {
    const media = getMediaMessage(message);
    if (!media) return reply('🖼️ Envie/responda a uma imagem ou vídeo curto usando *.s* ou *.sticker*.');
    if (media.seconds && Number(media.seconds) > 10) return reply('🎬 O vídeo é muito longo. Use um vídeo curto de até 10 segundos.');

    try {
      const type = media.mimetype?.startsWith('video/') ? 'video' : 'image';
      const stream = await downloadContentFromMessage(media, type);
      const input = await streamToBuffer(stream);
      let webp;

      if (type === 'video') {
        webp = await sharp(input, { animated: true })
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 75 })
          .toBuffer();
      } else {
        webp = await sharp(input)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 82 })
          .toBuffer();
      }

      const requester = requesterName(message);
      const name = getUser(message?.key?.participant || message?.key?.remoteJid)?.sticker_nick?.trim() || getDefaultStickerName();
      const finalWebp = await applyStickerMetadata(webp, name, requester, groupName(chat, message));

      await sock.sendMessage(chat, { sticker: finalWebp }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui criar a figurinha.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
