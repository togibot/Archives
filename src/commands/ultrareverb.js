import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'ultrareverb',
  aliases: ['ureverb'],
  category: 'music',
  description: 'Aplica reverberação de ambiente intensa com convolução.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('🌌 *Ultra Reverb* criando uma cauda de reverberação mais profunda...');

      const result = await processAudio(input, 'ultrareverb');

      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-ultra-reverb.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply('❌ Não consegui aplicar o Ultra Reverb.\\n' + (error?.message || 'Erro desconhecido'));
    }
  }
};