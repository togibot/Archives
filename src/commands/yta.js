import { downloadTrack, getAudioPayload, resolveMusic } from '../services/music.js';

export default {
  name: 'yta',
  aliases: ['ytaudio'],
  category: 'music',
  description: 'Encontra e envia áudio de uma faixa disponível para download.',
  async execute({ sock, chat, message, reply, args }) {
    const query = args.join(' ').trim();
    if (!query) return reply('🎧 Use: *.yta <nome da música>*');

    await reply(`🎧 Procurando *${query}*...`);

    try {
      const track = await resolveMusic(query);
      if (!track) return reply('❌ Não encontrei uma versão de áudio disponível para download.');

      const audio = await downloadTrack(track);
      await sock.sendMessage(chat, {
        ...getAudioPayload(audio, track),
        caption: `🎵 *TOGI MUSIC*\n🎧 ${track.name || query}\n🎤 ${track.artist_name || 'Artista desconhecido'}`
      }, { quoted: message });
    } catch (error) {
      console.error('[TOGI YTA]', error);
      return reply('❌ Não consegui preparar esse áudio. Tente outra música ou informe o artista.');
    }
  }
};
