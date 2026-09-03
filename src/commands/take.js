import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { applyStickerMetadata } from '../services/stickers.js';

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
  description: 'Reenvia uma figurinha usando exatamente o nome informado.',
  async execute({ sock, chat, message, args, sender, reply }) {
    const sticker = getQuotedSticker(message);
    if (!sticker) return reply('🏷️ Responda a uma *figurinha* com *.take <nome>* para renomeá-la.\n\nExemplo: *.take LZ*');

    const name = args.join(' ').trim();
    if (!name) return reply('🏷️ Informe o nome da figurinha.\n\nExemplo: *.take LZ*\n\nA figurinha ficará com o nome exatamente como você escreveu.');
    if (name.length > 80) return reply('❌ O nome pode ter no máximo 80 caracteres.');

    try {
      const stream = await downloadContentFromMessage(sticker, 'sticker');
      const input = await toBuffer(stream);
      const requester = message?.pushName || sender?.split('@')[0] || 'Usuário';
      const group = chat?.endsWith?.('@g.us') ? 'Grupo' : 'Privado';
      const finalSticker = await applyStickerMetadata(input, name, requester, group);
      await sock.sendMessage(chat, { sticker: finalSticker }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui renomear a figurinha.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
