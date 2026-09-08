import { downloadTrack, getAudioPayload } from '../services/music.js';
import { searchYouTubeTracks } from '../services/music/providers/youtube.js';

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
  description: 'Pesquisa a música e tenta múltiplos resultados até encontrar um áudio disponível.',
  async execute({ sock, chat, message, reply, args, sender }) {
    const query = args.join(' ').trim();
    if (!query) return reply('🎵 Use: *.play <nome da música>*\n\nExemplo: *.play Silent Circles GD*');

    await reply(`🔎 Pesquisando *${query}*...`);

    let candidates = [];
    try {
      candidates = await searchYouTubeTracks(query, 5);
    } catch (error) {
      console.error('[TOGI MUSIC SEARCH]', error);
    }

    if (!candidates.length) {
      return reply('❌ Não encontrei essa música.');
    }

    let identified = null;
    let track = null;
    let audio = null;
    let lastError = null;

    for (const candidate of candidates) {
      try {
        const candidateTrack = {
          ...candidate,
          source: 'YouTube',
          name: candidate.title,
          artist_name: candidate.artist
        };

        audio = await downloadTrack(candidateTrack);
        identified = candidate;
        track = candidateTrack;
        break;
      } catch (error) {
        lastError = error;
        console.warn(`[TOGI MUSIC FALLBACK] Falha em "${candidate.title}": ${error?.message || error}`);
      }
    }

    if (!identified || !track || !audio) {
      console.error('[TOGI MUSIC DOWNLOAD] Todos os resultados falharam:', lastError);
      return reply('❌ Não consegui preparar o áudio. Tente outra versão ou outro nome da música.');
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
      '┃ 🎧 Áudio encontrado e processado!',
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

    try {
      const payload = getAudioPayload(audio, {
        ...track,
        name: identified.title || track.name,
        artist_name: identified.artist || track.artist_name
      });
      await sock.sendMessage(chat, payload, { quoted: message });
    } catch (error) {
      console.error('[TOGI MUSIC SEND]', error);
      return reply('❌ O áudio foi preparado, mas não consegui enviá-lo.');
    }
  }
};
