import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function getImageMessage(message) {
  if (message.message?.imageMessage) return message.message.imageMessage;
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  return quoted?.imageMessage || null;
}

export default {
  name: 'sticker',
  aliases: ['s', 'fig'],
  category: 'sticker',
  description: 'Transforma uma imagem em figurinha',
  async execute({ sock, chat, message, reply }) {
    const image = getImageMessage(message);
    if (!image) return reply('🖼️ Envie uma imagem com *.sticker* ou responda a uma imagem com *.s*.');

    const stream = await downloadContentFromMessage(image, 'image');
    const input = await streamToBuffer(stream);
    const webp = await sharp(input)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82 })
      .toBuffer();

    await sock.sendMessage(chat, { sticker: webp }, { quoted: message });
  }
};
