import { downloadAudioTarget, getAudioTarget, processAudio } from '../services/audio-effects.js';

const DEFAULT_AMOUNT = 5;

export default {
  name: 'liquid',
  aliases: ['digitalliquid'],
  category: 'music',
  description: 'Aplica um efeito Digital Liquid ao áudio com intensidade de 1 a 10.',
  async execute({ sock, chat, message, reply, args }) {
    const rawAmount = args?.[0];
    const amount = rawAmount === undefined ? DEFAULT_AMOUNT : Number(rawAmount);

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 1 || amount > 10) {
      return reply('💧 Use: *.liquid <1-10>*\nExemplo: *.liquid 7*');
    }

    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);

      await reply(`💧 Aplicando *Digital Liquid ${amount}/10*...`);
      const result = await processAudio(input, 'liquid', amount);

      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: `togi-liquid-${amount}.mp3`,
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(`❌ Não consegui aplicar o Digital Liquid.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
