import { searchYouTubeTracks } from '../services/music/providers/youtube.js';

export default {
  name: 'yts',
  aliases: ['ytsearch'],
  category: 'music',
  description: 'Pesquisa músicas no YouTube e mostra resultados.',
  async execute({ reply, args }) {
    const query = args.join(' ').trim();
    if (!query) return reply('🔎 Use: *.yts <nome da música>*');

    try {
      const results = await searchYouTubeTracks(query, 5);
      if (!results.length) return reply('❌ Nenhum resultado encontrado.');

      const text = results.map((item, index) =>
        `*${index + 1}.* 🎵 ${item.title}\n   👤 ${item.artist}\n   🔗 https://youtu.be/${item.videoId}`
      ).join('\n\n');

      return reply(`🔎 *TOGI YOUTUBE SEARCH*\n\n${text}`);
    } catch (error) {
      console.error('[TOGI YTS]', error);
      if (error?.code === 'YOUTUBE_QUOTA_EXCEEDED') {
        return reply('⚠️ A busca do YouTube atingiu o limite de cota da API.');
      }
      return reply('❌ Não consegui pesquisar no YouTube agora.');
    }
  }
};
