import { searchMatchingPair } from '../services/metadinha.js';

export default {
  name: 'metadinha',
  aliases: ['metadinhaa', 'matchingpfp'],
  category: 'fun',
  description: 'Pesquisa duas fotos de perfil combinando.',
  async execute({ sock, chat, message, reply, args }) {
    const query = args?.join(' ').trim() || 'anime';

    try {
      await reply(`🖼️ Procurando uma metadinha de *${query}*...`);

      const pair = await searchMatchingPair(query);
      if (!pair) {
        return reply('❌ Não encontrei uma dupla de imagens para esse tema.');
      }

      await sock.sendMessage(chat, {
        image: { url: pair.first.src.medium },
        caption: `💜 *METADINHA 1/2*\nTema: *${query}*\n\n📸 ${pair.first.photographer} — Pexels\n🔗 ${pair.first.url}`
      }, { quoted: message });

      await sock.sendMessage(chat, {
        image: { url: pair.second.src.medium },
        caption: `💜 *METADINHA 2/2*\nTema: *${query}*\n\n📸 ${pair.second.photographer} — Pexels\n🔗 ${pair.second.url}`
      }, { quoted: message });

      return reply('✨ Pronto! Agora é só usar as duas como foto de perfil.');
    } catch (error) {
      return reply(`❌ Não consegui pesquisar metadinhas.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
