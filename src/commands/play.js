import yts from 'yt-search';

function formatViews(value) {
  const views = Number(value) || 0;
  return views.toLocaleString('pt-BR');
}

function safeText(value, fallback = 'Não informado') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

export default {
  name: 'play',
  aliases: [],
  category: 'music',
  async execute({ reply, args }) {
    const query = args.join(' ').trim();

    if (!query) {
      return reply('❌ Use: .play <nome da música>\n\nExemplo: .play Silent Circles GD');
    }

    const result = await yts(query);
    const video = result?.videos?.[0];

    if (!video) {
      return reply('❌ Não encontrei nenhuma música com esse nome.');
    }

    const title = safeText(video.title);
    const duration = safeText(video.timestamp, 'Desconhecido');
    const views = formatViews(video.views);
    const artist = safeText(video.author?.name, 'Desconhecido');
    const posted = safeText(video.ago, 'Desconhecido');
    const link = safeText(video.url);
    const description = safeText(video.description, 'Sem descrição disponível.');

    const text = [
      '⸻͟͞ꪶ MUSIC PLAYER ᭄',
      '   ↳ 『 Música solicitada 』 ♪',
      '-',
      '     ⸻͟͞ꪶ DETALHES 🎧 ↴',
      '-',
      ` 🎵 ➮ Título⧽ ${title}`,
      ` ⏳ ➮ Tempo⧽ ${duration}`,
      ` 📊 ➮ Views⧽ ${views}`,
      ` 🎤 ➮ Artista⧽ ${artist}`,
      ` 📅 ➮ Postado⧽ ${posted}`,
      ` 🌐 ➮ Link⧽ ${link}`,
      ` 📝 ➮ Desc⧽ ${description.slice(0, 500)}`,
      '-',
      '     ⌁ Música encontrada no YouTube.',
      '-'
    ].join('\n');

    return reply(text);
  }
};
