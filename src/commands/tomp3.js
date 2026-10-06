import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'tomp3',
  aliases: ['mp3'],
  category: 'music',
  description: 'Converte um áudio ou vídeo para MP3.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('🔄 Convertendo para *MP3*...');
      const result = await processAudio(input, 'tomp3');
      await sock.sendMessage(chat, {
        document: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-audio.mp3',
        caption: '🎵 *TOGI AUDIO* — MP3 pronto!'
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui converter para MP3.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
