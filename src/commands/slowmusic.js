import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'slowmusic',
  aliases: [],
  category: 'music',
  description: 'Deixa a música mais lenta preservando o pitch.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('🐌 Processando *Slow Music*...');
      const result = await processAudio(input, 'slowmusic');
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-slowmusic.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui aplicar o Slow Music.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
