import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { applyStickerMetadata } from '../services/stickers.js';
import { getUser } from '../database/index.js';

async function toBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function unwrap(value) {
  let current = value;
  for (let i = 0; i < 5 && current; i++) {
    if (current.ephemeralMessage?.message) current = current.ephemeralMessage.message;
    else if (current.viewOnceMessage?.message) current = current.viewOnceMessage.message;
    else if (current.viewOnceMessageV2?.message) current = current.viewOnceMessageV2.message;
    else break;
  }
  return current;
}

function getQuotedSticker(message) {
  const current = unwrap(message.message);
  const quoted = unwrap(current?.extendedTextMessage?.contextInfo?.quotedMessage);
  return quoted?.stickerMessage || null;
}

export default {
  name: 'take',
  aliases: ['roubarfig', 'renamefig'],
  category: 'sticker',
  description: 'Reenvia uma figurinha com seu nick personalizado.',
  async execute({ sock, chat, message, sender, reply }) {
    const sticker = getQuotedSticker(message);
    if (!sticker) return reply('🏷️ Responda a uma *figurinha* com *.take* para colocar seu nick nela.');

    const nick = getUser(sender)?.sticker_nick?.trim();
    if (!nick) return reply('🏷️ Você ainda não configurou seu nick. Use *.nick <nome>* primeiro.');

    try {
      const stream = await downloadContentFromMessage(sticker, 'sticker');
      const input = await toBuffer(stream);
      const finalSticker = await applyStickerMetadata(input, nick, message?.pushName || sender.split('@')[0], chat?.endsWith?.('@g.us') ? 'Grupo' : 'Privado');
      await sock.sendMessage(chat, { sticker: finalSticker }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui renomear a figurinha.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
