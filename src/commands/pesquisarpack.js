import {
  searchStickerPacks,
  saveStickerPackSelection
} from '../services/sticker-search.js';

function compactNumber(value) {
  const n = Number(value || 0);
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace('.0', '')}k`;
  return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.0', '')}M`;
}

export default {
  name: 'pesquisarpack',
  aliases: ['pp', 'searchpack', 'packsearch'],
  category: 'sticker',
  description: 'Pesquisa packs de figurinhas por qualquer tema.',
  async execute({ sock, chat, message, sender, args, reply }) {
    const query = args.join(' ').trim();
    if (!query) {
      return reply('🔎 Use: *.pp <tema>*\nEx.: *.pp One Piece*');
    }

    await reply(`🔎 Procurando packs de *${query}*…`);

    try {
      const packs = await searchStickerPacks(query, 8);
      if (!packs.length) {
        return reply(`❌ Não achei packs para *${query}*. Tenta outro termo.`);
      }

      saveStickerPackSelection(chat, sender, query, packs);

      const text = packs.map((pack, index) => {
        const type = pack.isAnimated ? '🎞️ Animado' : '🖼️ Estático';
        return [
          `*${index + 1}. ${pack.name}*`,
          `👤 ${pack.author}`,
          `🎨 ${pack.stickerCount} FIGs • ${type}`,
          `🔥 ${compactNumber(pack.viewCount)} views • 📥 ${compactNumber(pack.exportCount)} usos`
        ].join('\n');
      }).join('\n\n');

      const caption = `╭━━━〔 🔎 *PACK SEARCH* 〕━━━╮
┃ Tema: *${query}*
┃ Resultados: *${packs.length}*
╰━━━━━━━━━━━━━━━━━━━━━━╯

${text}

📦 Escolha um resultado com:
*.pb <número>*
Ex.: *.pb 2*

⏳ A seleção fica salva por 10 minutos.`;

      const first = packs.find(pack => pack.thumbnailUrl);
      if (first) {
        try {
          return await sock.sendMessage(chat, {
            image: { url: first.thumbnailUrl },
            caption
          }, { quoted: message });
        } catch {}
      }

      return reply(caption);
    } catch (error) {
      console.error('[TOGI PACK SEARCH]', error);
      const reason = error?.name === 'AbortError'
        ? 'a pesquisa demorou demais'
        : error?.message || 'erro desconhecido';
      return reply(`❌ Não consegui pesquisar packs agora.\n${reason}`);
    }
  }
};
