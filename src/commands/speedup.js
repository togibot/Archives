import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'speedup',
  aliases: ['speed'],
  category: 'music',
  description: 'Acelera o áudio alterando também o pitch.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('⚡ Processando *Speed Up*...');
      const result = await processAudio(input, 'speedup');
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-speedup.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui acelerar o áudio.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
