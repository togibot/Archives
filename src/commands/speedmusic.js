import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'speedmusic',
  aliases: [],
  category: 'music',
  description: 'Acelera a música preservando o pitch.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('🎵 Processando *Speed Music*...');
      const result = await processAudio(input, 'speedmusic');
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-speedmusic.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui aplicar o Speed Music.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
