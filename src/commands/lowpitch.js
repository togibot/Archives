import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'lowpitch',
  aliases: ['low-pitch'],
  category: 'music',
  description: 'Diminui o pitch do áudio sem alterar sua duração.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('⬇️ Processando *Low Pitch*...');
      const result = await processAudio(input, 'lowpitch');
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-lowpitch.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui aplicar o Low Pitch.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
