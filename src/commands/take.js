import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { ensureUser, updateUser } from '../database/index.js';
import { getName } from '../utils/message.js';
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
  description: 'Reenvia uma figurinha usando o Nick cadastrado pelo usuário.',
  async execute({ sock, chat, message, sender, reply }) {
    const sticker = getQuotedSticker(message);
    if (!sticker) return reply('🏷️ Responda a uma *figurinha* com *.take* para usar seu Nick cadastrado.\n\nExemplo: *.nick 𝙻𝚉* e depois *.take*');

    const user = ensureUser(sender, getName(message));
    const name = String(user?.sticker_nick || '').trim();
    if (!name) return reply('🏷️ Você ainda não possui um Nick cadastrado.\n\nUse *.nick <seu Nick>* primeiro.\nExemplo: *.nick 𝙻𝚉*');

    try {
      const stream = await downloadContentFromMessage(sticker, 'sticker');
      const input = await toBuffer(stream);
      const requester = message?.pushName || sender?.split('@')[0] || 'Usuário';
      const group = chat?.endsWith?.('@g.us') ? 'Grupo' : 'Privado';
      const finalSticker = await applyStickerMetadata(input, name, requester, group);
      await sock.sendMessage(chat, { sticker: finalSticker }, { quoted: message });
      // Keep the Nick persisted; this also makes the command safe if the user was created just now.
      updateUser(sender, { sticker_nick: name });
    } catch (error) {
      return reply(`❌ Não consegui renomear a figurinha.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
