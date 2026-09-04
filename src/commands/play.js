import { downloadTrack, getAudioPayload, resolveMusic } from '../services/music.js';

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
  description: 'Pesquisa a música e tenta encontrar áudio em fontes permitidas.',
  async execute({ sock, chat, message, reply, args }) {
    const query = args.join(' ').trim();

    if (!query) {
      return reply('🎵 Use: *.play <nome da música>*\n\nExemplo: *.play Silent Circles GD*');
    }

    await reply(`🎧 Pesquisando *${query}*...`);

    let track;
    try {
      track = await resolveMusic(query);
    } catch (error) {
      if (error?.code === 'YOUTUBE_QUOTA_EXCEEDED') {
        return reply('🎵 *Busca do YouTube temporariamente limitada.*\n\nA cota da API acabou. O Togi não baixa áudio do YouTube; ele continua usando fontes de áudio permitidas quando disponíveis.');
      }
      console.error('[TOGI MUSIC]', error);
      return reply('❌ Não consegui concluir a busca agora. Tente novamente em alguns segundos.');
    }

    if (!track) {
      return reply('❌ Não encontrei áudio compatível em uma fonte com download permitido.\n\n💡 Tente informar *música + artista*.');
    }

    await reply(`⬇️ Preparando *${clean(track.name)}* — ${clean(track.artist_name, 'Artista desconhecido')}...`);

    try {
      const audio = await downloadTrack(track);
      const payload = getAudioPayload(audio, track);
      const caption = [
        '🎵 *TOGI MUSIC BETA*', '',
        `🎧 ${clean(track.name)}`,
        `🎤 ${clean(track.artist_name, 'Artista desconhecido')}`,
        `⏱️ ${formatDuration(track.duration)}`,
        `📚 Áudio: ${clean(track.source, 'Fonte permitida')}`,
        track.identifiedBy ? `🔎 Pesquisa: ${track.identifiedBy}` : '',
        track.license ? `📜 Licença: ${clean(track.license)}` : '', '',
        '✅ Áudio obtido de uma fonte que disponibiliza download.'
      ].filter(Boolean).join('\n');

      await sock.sendMessage(chat, { ...payload, caption }, { quoted: message });
    } catch (error) {
      console.error('[TOGI MUSIC DOWNLOAD]', error);
      return reply('❌ Encontrei a música, mas a fonte de áudio não respondeu corretamente. Tente outra busca.');
    }
  }
};
