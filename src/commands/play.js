import { downloadTrack, getAudioPayload, resolveMusic } from '../services/music.js';
import { searchYouTubeTrack } from '../services/music/providers/youtube.js';

function clean(value, fallback = 'Não informado') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  if (!total) return 'Não informado';
  return `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`;
}

function formatViews(value) {
  const views = Number(value) || 0;
  return views ? views.toLocaleString('pt-BR') : 'Não informado';
}

function truncate(value, max = 300) {
  const text = clean(value, 'Sem descrição');
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function mentionText(jid) {
  const number = clean(jid).split('@')[0];
  return number ? `@${number}` : 'usuário';
}

async function fetchThumbnail(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const type = String(response.headers.get('content-type') || '');
    if (!type.startsWith('image/')) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) return null;
    return buffer;
  } catch {
    return null;
  }
}

export default {
  name: 'play',
  aliases: [],
  category: 'music',
  description: 'Pesquisa a música, mostra detalhes com thumbnail e envia áudio disponível.',
  async execute({ sock, chat, message, reply, args, sender }) {
    const query = args.join(' ').trim();
    if (!query) return reply('🎵 Use: *.play <nome da música>*\n\nExemplo: *.play Silent Circles GD*');

    await reply(`🔎 Pesquisando *${query}*...`);

    let identified = null;
    try {
      identified = await searchYouTubeTrack(query);
    } catch (error) {
      console.error('[TOGI MUSIC SEARCH]', error);
    }

    if (!identified) {
      return reply('❌ Não encontrei essa música.');
    }

    const player = [
      '╭━━━〔 🎵 𝐌𝐔𝐒𝐈𝐂 𝐏𝐋𝐀𝐘𝐄𝐑 〕━━━╮',
      `┃ 👤 Solicitado por: ${mentionText(sender)}`,
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
      '',
      '╭━━〔 🎧 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 〕━━╮',
      `┃ 🎵 *Título:* ${clean(identified.title)}`,
      `┃ ⏳ *Duração:* ${formatDuration(identified.duration)}`,
      `┃ 📊 *Views:* ${formatViews(identified.views)}`,
      `┃ 🎤 *Artista:* ${clean(identified.artist, 'Artista desconhecido')}`,
      `┃ 📅 *Postado:* ${clean(identified.ago)}`,
      `┃ 🌐 *Link:* ${clean(identified.url)}`,
      `┃ 📝 *Descrição:* ${truncate(identified.description)}`,
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯',
      '',
      '╭━━〔 ⌁ 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐀𝐍𝐃𝐎 〕━━╮',
      '┃ 🎧 Processando o áudio...',
      '┃ ıllı.ıllı.ıllı.ıllı',
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯'
    ].join('\n');

    const thumbnail = await fetchThumbnail(identified.thumbnail);
    if (thumbnail) {
      await sock.sendMessage(chat, {
        image: thumbnail,
        caption: player,
        mentions: sender ? [sender] : []
      }, { quoted: message });
    } else {
      await reply(player, { mentions: sender ? [sender] : [] });
    }

    let track;
    try {
      track = await resolveMusic(query, identified);
    } catch (error) {
      console.error('[TOGI MUSIC]', error);
      return reply('❌ Não consegui preparar o áudio agora.');
    }

    if (!track) {
      return reply('❌ Não encontrei uma fonte de áudio disponível para essa faixa.');
    }

    try {
      const audio = await downloadTrack(track);
      const payload = getAudioPayload(audio, {
        ...track,
        name: identified.title || track.name,
        artist_name: identified.artist || track.artist_name
      });
      await sock.sendMessage(chat, payload, { quoted: message });
    } catch (error) {
      console.error('[TOGI MUSIC DOWNLOAD]', error);
      return reply('❌ A fonte de áudio não respondeu corretamente.');
    }
  }
};
