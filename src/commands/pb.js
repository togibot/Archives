import {
  getStickerPackSelection,
  getStickerPackDetail,
  downloadStickerFile
} from '../services/sticker-search.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const MAX_SEND = 60;

export default {
  name: 'pb',
  aliases: ['packbaixar', 'baixarpack'],
  category: 'sticker',
  description: 'Envia um pack escolhido na última pesquisa de packs.',
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
      return reply('⌛ Sua pesquisa expirou. Pesquise de novo com *.pp <tema>*.');
    }
    if (selected?.error === 'position') {
      return reply(`❌ Escolha um número entre *1* e *${selected.count}*.`);
    }

    await reply(`📦 Preparando *${selected.pack.name}*…`);

    try {
      const pack = await getStickerPackDetail(selected.pack);
      const stickers = pack.stickers.slice(0, MAX_SEND);

      await reply(`╭━━━〔 📦 *${pack.name}* 〕━━━╮
┃ 👤 ${pack.author}
┃ 🎨 ${stickers.length}${pack.stickers.length > MAX_SEND ? `/${pack.stickers.length}` : ''} FIGs
╰━━━━━━━━━━━━━━━━━━━━━━╯

⏳ Enviando o pack…`);

      let sent = 0;
      let failed = 0;

      for (const sticker of stickers) {
        try {
          const buffer = await downloadStickerFile(sticker.url);
          await sock.sendMessage(chat, { sticker: buffer });
          sent += 1;
          await wait(140);
        } catch (error) {
          failed += 1;
          console.error(`[TOGI PB] FIG #${sticker.index} falhou:`, error?.message || error);
        }
      }

      if (!sent) {
        return reply('❌ Não consegui enviar nenhuma FIG desse pack.');
      }

      if (failed || pack.stickers.length > MAX_SEND) {
        const notes = [];
        if (failed) notes.push(`${failed} FIG(s) falharam`);
        if (pack.stickers.length > MAX_SEND) notes.push(`limite de ${MAX_SEND} FIGs por envio`);
        return reply(`✅ *${pack.name}* enviado • ${sent} FIGs.\n⚠️ ${notes.join(' • ')}.`);
      }

      return reply(`✅ *${pack.name}* enviado • ${sent} FIGs.`);
    } catch (error) {
      console.error('[TOGI PB]', error);
      const reason = error?.name === 'AbortError'
        ? 'o Sticker.ly demorou demais para responder'
        : error?.message || 'erro desconhecido';
      return reply(`❌ Não consegui baixar esse pack agora.\n${reason}`);
    }
  }
};
