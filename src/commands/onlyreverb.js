import { downloadAudioTarget, getAudioTarget, processOnlyReverb } from '../services/audio-effects.js';

export default {
  name: 'onlyreverb',
  aliases: ['only-reverb', 'onlyrv'],
  category: 'music',
  description: 'Separa a voz da música e aplica reverberação natural.',
  async execute({ sock, chat, message, reply, args }) {
    const mode = String(args?.[0] || '').trim().toLowerCase();
    if (!['normal', 'ultra'].includes(mode)) {
      return reply(
        '🎤 *ONLY REVERB*\\n\\n' +
        'Escolha um modo: *.onlyreverb normal* ou *.onlyreverb ultra*\\n\\n' +
        '• *Normal:* separação vocal mais rápida.\\n' +
        '• *Ultra:* modelo vocal de maior qualidade, com processamento mais pesado.'
      );
    }
    try {
      const target = getAudioTarget(message);
      const input = await downloadAudioTarget(target);
      await reply(
        mode === 'ultra'
          ? '💜 *Only Reverb Ultra:* isolando a voz com o modelo avançado. Isso pode levar alguns minutos...'
          : '🎤 *Only Reverb Normal:* separando a voz e preparando a reverberação...'
      );
      const result = await processOnlyReverb(input, mode);
      await sock.sendMessage(chat, {
        audio: result.buffer,
        mimetype: result.mimeType,
        fileName: mode === 'ultra' ? 'togi-only-reverb-ultra.mp3' : 'togi-only-reverb-normal.mp3',
        ptt: false
      }, { quoted: message });
    } catch (error) {
      return reply(
        '❌ Não consegui processar o Only Reverb.\\n' +
        (error?.message || 'Erro desconhecido')
      );
    }
  }
};
