import { downloadTrack, getTrackFileName, searchPlayableTrack } from '../services/music.js';

function clean(value, fallback = 'Não informado') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

export default {
  name: 'play',
  aliases: [],
  category: 'music',
  description: 'Pesquisa em várias fontes e envia faixas com download permitido.',
  async execute({ sock, chat, message, reply, args }) {
    const query = args.join(' ').trim();

    if (!query) {
      return reply('🎵 Use: *.play <nome da música>*\n\nExemplo: *.play ambient chill*');
    }

    if (!process.env.FMA_KEY && !process.env.FMA_API_KEY && !process.env.JAMENDO_CLIENT_ID) {
      return reply('⚙️ O sistema de música ainda não foi configurado.\n\nDefina *FMA_KEY* no `.env` para ativar o catálogo principal. *JAMENDO_CLIENT_ID* continua disponível como fallback.');
    }

    await reply(`🎧 Procurando *${query}* em várias fontes...`);

    let track;
    try {
      track = await searchPlayableTrack(query);
    } catch (error) {
      if (error?.code === 'YOUTUBE_QUOTA_EXCEEDED') {
        return reply('🎵 *Busca temporariamente limitada*\n\nA fonte de identificação atingiu a cota. O Togi ainda pode usar os catálogos licenciados configurados.');
      }
      throw error;
    }

    if (!track) {
      return reply('❌ Não encontrei uma faixa compatível com download permitido.\n\nTente outro nome, artista ou gênero.');
    }

    await reply(`⬇️ Preparando *${clean(track.name)}* — ${clean(track.artist_name, 'Artista desconhecido')}...`);

    const audio = await downloadTrack(track);
    const fileName = getTrackFileName(track);
    const caption = [
      '🎵 *TOGI MUSIC BETA*',
      '',
      `🎧 ${clean(track.name)}`,
      `🎤 ${clean(track.artist_name, 'Artista desconhecido')}`,
      `⏱️ ${formatDuration(track.duration)}`,
      `📚 Fonte: ${clean(track.source, 'Catálogo licenciado')}`,
      track.license ? `📜 Licença: ${clean(track.license)}` : '',
      '',
      '✅ Áudio obtido de um catálogo que permite download da faixa.'
    ].filter(Boolean).join('\n');

    await sock.sendMessage(chat, {
      audio,
      mimetype: 'audio/mpeg',
      fileName,
      ptt: false,
      caption
    }, { quoted: message });
  }
};
