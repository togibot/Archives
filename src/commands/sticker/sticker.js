import { ensureUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';
import { applyStickerMetadata } from '../../services/stickers.js';
import { getStickerMedia, mediaToStickerWebp } from '../../services/sticker-media.js';

async function groupName(sock, chat) {
  if (!chat?.endsWith?.('@g.us')) return 'Privado';
  try {
    const metadata = await sock.groupMetadata(chat);
    return metadata?.subject || 'Grupo';
  } catch {
    return 'Grupo';
  }
}

export default {
  name: 'sticker',
  aliases: ['s', 'fig'],
  category: 'sticker',
  description: 'Transforma imagem, vídeo, GIF ou figurinha em uma FIG do Togi.',
  async execute({ sock, chat, message, sender, reply }) {
    const source = getStickerMedia(message);
    if (!source) {
      return reply('🖼️ Envie ou responda uma *imagem, vídeo, GIF ou figurinha* com *.s*.');
    }

    try {
      const webp = await mediaToStickerWebp(source);
      const user = ensureUser(sender, getName(message));
      const nick = String(user?.sticker_nick || '').trim();
      const requester = message?.pushName || sender?.split('@')[0] || 'Usuário';

      const finalWebp = await applyStickerMetadata(
        webp,
        nick,
        requester,
        await groupName(sock, chat),
        { mode: 'normal' }
      );

      await sock.sendMessage(chat, { sticker: finalWebp }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui criar a figurinha.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
