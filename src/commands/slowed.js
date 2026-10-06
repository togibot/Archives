import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

export default {
  name: 'slowed',
  aliases: [],
  category: 'music',
  description: 'Deixa um áudio mais lento, alterando também o pitch.',
  async execute({ sock, chat, message, reply }) {
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply('🐌 Processando *Slowed*...');
      const result = await processAudio(input, 'slowed');
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: 'togi-slowed.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui criar o Slowed.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
