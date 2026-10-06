import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'highpitch',
  aliases: ['high-pitch'],
  category: 'music',
  description: 'Aumenta o pitch do áudio sem alterar sua duração.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('⬆️ Processando *High Pitch*...');
      const result = await processAudio(input, 'highpitch');
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-highpitch.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui aplicar o High Pitch.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
