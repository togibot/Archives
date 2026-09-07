import { downloadTrack, getAudioPayload, resolveMusic } from '../services/music.js';
import { searchYouTubeTrack } from '../services/music/providers/youtube.js';

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

function formatViews(value) {
  const views = Number(value) || 0;
  return views ? views.toLocaleString('pt-BR') : 'Não informado';
}

function truncate(value, max = 220) {
  const text = clean(value, 'Sem descrição');
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function mentionText(jid) {
  const number = clean(jid).split('@')[0];
  return number ? `@${number}` : 'usuário';
}

export default {
  name: 'play',
  aliases: [],
  category: 'music',
  description: 'Pesquisa a música, mostra o Music Player e envia áudio disponível.',
  async execute({ sock, chat, message, reply, args, sender }) {
    const query = args.join(' ').trim();

    if (!query) {
      return reply('🎵 Use: *.play <nome da música>*\n\nExemplo: *.play Silent Circles GD*');
    }

    await reply(`🔎 Pesquisando *${query}*...`);

    let identified;
    try {
      identified = await searchYouTubeTrack(query);
    } catch (error) {
      console.error('[TOGI MUSIC SEARCH]', error);
      identified = null;
    }

    if (identified) {
      const player = [
        '⸻͟͞ꪶ *MUSIC PLAYER* ᭄',
        `   ↳ 『 ${mentionText(sender)} 』 ♪`,
        '-',
        '     ⸻͟͞ꪶ *DETALHES 🎧* ↴',
        '-',
        ` ஓீ፝͜͡🎵 ➮ *Titulo*⧽ ${clean(identified.title)}`,
        ` ஓீ፝͜͡⏳ ➮ *Tempo*⧽ ${formatDuration(identified.duration)}`,
        ` ஓீ፝͜͡📊 ➮ *Views*⧽ ${formatViews(identified.views)}`,
        ` ஓீ፝͜͡🎤 ➮ *Artista*⧽ ${clean(identified.artist, 'Artista desconhecido')}`,
        ` ஓீ፝͜͡📅 ➮ *Postado*⧽ ${clean(identified.ago, 'Não informado')}`,
        ` ஓீ፝͜͡🌐 ➮ *Link*⧽ ${clean(identified.url)}`,
        ` ஓீ፝͜͡📝 ➮ *Desc*⧽ ${truncate(identified.description)}`,
        '-',
        '     ⌁ *Processando o áudio...*',
        '-',
        'ıllı.ıllı.ıllı.ıllı'
      ].join('\n');

      await reply(player, { mentions: sender ? [sender] : [] });
    } else {
      await reply('🎧 Não consegui identificar a música no YouTube. Procurando diretamente nas fontes de áudio disponíveis...');
    }

    let track;
    try {
      track = await resolveMusic(query);
    } catch (error) {
      console.error('[TOGI MUSIC]', error);
      return reply('❌ Não consegui preparar o áudio agora. Tente novamente em alguns segundos.');
    }

    if (!track) {
      return reply('❌ Encontrei a música, mas não há uma versão de áudio disponível para download em uma fonte permitida.');
    }

    try {
      const audio = await downloadTrack(track);
      const payload = getAudioPayload(audio, track);
      await sock.sendMessage(chat, payload, { quoted: message });
    } catch (error) {
      console.error('[TOGI MUSIC DOWNLOAD]', error);
      return reply('❌ A fonte de áudio não respondeu corretamente. Tente outra busca.');
    }
  }
};
