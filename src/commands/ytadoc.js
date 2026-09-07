import { downloadTrack, getAudioFileName, resolveMusic } from '../services/music.js';

export default {
  name: 'ytadoc',
  aliases: ['ytadocumento'],
  category: 'music',
  description: 'Encontra uma faixa disponível e envia o áudio como documento.',
  async execute({ sock, chat, message, reply, args }) {
    const query = args.join(' ').trim();
    if (!query) return reply('📄 Use: *.ytadoc <nome da música>*');

    await reply(`📄 Preparando *${query}*...`);

    try {
      const track = await resolveMusic(query);
      if (!track) return reply('❌ Não encontrei uma versão de áudio disponível para download.');

      const audio = await downloadTrack(track);
      await sock.sendMessage(chat, {
        document: audio,
        mimetype: 'audio/mpeg',
        fileName: getAudioFileName(track),
        caption: `🎵 *TOGI MUSIC*\n${track.name || query}\n${track.artist_name || 'Artista desconhecido'}`
      }, { quoted: message });
    } catch (error) {
      console.error('[TOGI YTADOC]', error);
      return reply('❌ Não consegui preparar esse áudio como documento.');
    }
  }
};
