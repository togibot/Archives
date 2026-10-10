import {
  getStickerPackSelection,
  getStickerPackDetail,
  downloadStickerFile
} from '../services/sticker-search.js';
import { sendNativeStickerPack } from '../services/sticker-pack-native.js';

const MAX_PACK_STICKERS = 60;
const DOWNLOAD_CONCURRENCY = 5;

async function downloadPackStickers(stickers) {
  const source = stickers.slice(0, MAX_PACK_STICKERS);
  const results = new Array(source.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= source.length) return;

      const sticker = source[index];
      try {
        results[index] = {
          sticker: await downloadStickerFile(sticker.url),
          emojis: ['✨'],
          accessibilityLabel: `Sticker #${sticker.index}`
        };
      } catch (error) {
        console.error(
          `[TOGI PB] Download da FIG #${sticker.index} falhou:`,
          error?.message || error
        );
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(DOWNLOAD_CONCURRENCY, source.length) },
      () => worker()
    )
  );

  return {
    items: results.filter(Boolean),
    failed: results.filter(item => !item).length,
    truncated: stickers.length > MAX_PACK_STICKERS
  };
}

export default {
  name: 'pb',
  aliases: ['packbaixar', 'baixarpack'],
  category: 'sticker',
  description: 'Envia como pack nativo o resultado escolhido na última pesquisa.',
  async execute({ sock, chat, sender, args, reply }) {
    const position = Number(args[0]);

    if (!Number.isInteger(position) || position < 1) {
      return reply('📦 Use: *.pb <número>*\nPrimeiro pesquise com *.pp <tema>*.');
    }

    const selected = getStickerPackSelection(chat, sender, position);

    if (selected?.error === 'missing') {
      return reply('🔎 Você ainda não pesquisou packs aqui. Use *.pp <tema>* primeiro.');
    }
    if (selected?.error === 'expired') {
      return reply('⌛ Sua pesquisa expirou. Pesquise novamente com *.pp <tema>*.');
    }
    if (selected?.error === 'position') {
      return reply(`❌ Escolha um número entre *1* e *${selected.count}*.`);
    }

    await reply(`📦 Baixando *${selected.pack.name}* e preparando o pack nativo…`);

    try {
      const pack = await getStickerPackDetail(selected.pack);
      const downloaded = await downloadPackStickers(pack.stickers);

      if (!downloaded.items.length) {
        return reply('❌ Não consegui baixar nenhuma FIG desse pack.');
      }

      const sent = await sendNativeStickerPack(
        sock,
        chat,
        {
          id: `stickerly-${pack.id}`,
          name: pack.name,
          publisher: pack.author,
          description: 'Pack encontrado pelo Togi Bot',
          cover: downloaded.items[0].sticker
        },
        downloaded.items
      );

      console.log(
        `[TOGI PB NATIVE] ${pack.name} enviado em ${sent.parts} parte(s): ${sent.messageIds.join(', ')}`
      );

      if (downloaded.failed || downloaded.truncated) {
        const notes = [];
        if (downloaded.failed) notes.push(`${downloaded.failed} FIG(s) não puderam ser baixadas`);
        if (downloaded.truncated) notes.push(`o WhatsApp aceita até ${MAX_PACK_STICKERS} FIGs por pack`);
        await reply(`⚠️ Pack enviado com ${downloaded.items.length} FIGs. ${notes.join(' • ')}.`);
      }

      return;
    } catch (error) {
      console.error('[TOGI PB NATIVE]', error);
      const reason = error?.name === 'AbortError'
        ? 'a operação demorou demais'
        : error?.message || 'erro desconhecido';

      return reply(`❌ Não consegui enviar esse pack como pack nativo.\n${reason}`);
    }
  }
};
