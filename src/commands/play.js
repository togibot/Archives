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
  description: 'Busca e envia uma faixa com download permitido.',
  async execute({ sock, chat, message, reply, args }) {
    const query = args.join(' ').trim();

    if (!query) {
      return reply('🎵 Use: *.play <nome da música>*\n\nExemplo: *.play ambient chill*');
    }

    if (!process.env.JAMENDO_CLIENT_ID) {
      return reply('⚙️ O sistema de música ainda não foi configurado no servidor.\n\nDefina *JAMENDO_CLIENT_ID* no arquivo `.env` e reinicie o Togi.');
    }

    await reply(`🎧 Procurando *${query}*...`);

    const track = await searchPlayableTrack(query);
    if (!track) {
      return reply('❌ Não encontrei uma faixa com download permitido para esse pedido.\n\nTente outro nome, artista ou gênero.');
    }

    await reply(`⬇️ Preparando *${clean(track.name)}* — ${clean(track.artist_name, 'Artista desconhecido')}...`);

    const audio = await downloadTrack(track);
    const fileName = getTrackFileName(track);
    const caption = [
      '🎵 *TOGI MUSIC*',
      '',
      `🎧 ${clean(track.name)}`,
      `🎤 ${clean(track.artist_name, 'Artista desconhecido')}`,
      `⏱️ ${formatDuration(track.duration)}`,
      '',
      '📚 Faixa disponibilizada com download permitido pelo catálogo.'
    ].join('\n');

    await sock.sendMessage(chat, {
      audio,
      mimetype: 'audio/mpeg',
      fileName,
      ptt: false,
      caption
    }, { quoted: message });
  }
};
