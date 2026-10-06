import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: '8d',
  aliases: ['8d-audio', 'audio8d'],
  category: 'music',
  description: 'Aplica efeito de áudio 8D com movimento estéreo.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);

      await reply('🎧 Aplicando *8D Audio*...');
      const result = await processAudio(input, '8d');

      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-8d.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui aplicar o 8D.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
