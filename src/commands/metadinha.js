import { getMetadinhaOptions, searchMetadinhaImages } from '../services/metadinha.js';

export default {
  name: 'metadinha',
  aliases: ['matchingpfp'],
  category: 'fun',
  description: 'Pesquisa e envia duas metadinhas por tema e combinação.',
  async execute({ sock, chat, message, reply, args }) {
    const input = args?.join(' ').trim() || 'anime';

    if (['ajuda', 'help', 'opcoes', 'opções'].includes(input.toLowerCase())) {
      return reply(`🖼️ *METADINHAS*

Use:
*.metadinha <tipo> <tema>*

Tipos:
👦👦 *mm* — Menino + Menino
👧👧 *ff* — Menina + Menina
👦👧 *mf* — Menino + Menina
🎲 *random* — Aleatório

Exemplos:
*.metadinha mm anime*
*.metadinha ff dark*
*.metadinha mf cute*
*.metadinha random friends*

💜 O Togi baixa e envia as duas imagens automaticamente.`);
    }

    const [rawType, ...themeParts] = input.split(' ');
    const type = ['mm', 'ff', 'mf', 'random'].includes(rawType.toLowerCase())
      ? rawType.toLowerCase()
      : 'random';

    const theme = type === 'random' && rawType === input
      ? input
      : (themeParts.join(' ') || (type === 'random' ? input : 'anime'));

    try {
      await reply('🖼️ *Procurando uma metadinha...*\n🔎 Buscando duas imagens compatíveis...');

      const images = await searchMetadinhaImages(theme, type);
      const option = getMetadinhaOptions().find(x => x.key === type)?.label || '🎲 Aleatório';

      await sock.sendMessage(chat, {
        image: images[0].buffer,
        mimetype: images[0].mimeType,
        caption: `🖼️ *METADINHA — 1/2*\n🎯 ${option}\n🎨 ${theme}`
      }, { quoted: message });

      await sock.sendMessage(chat, {
        image: images[1].buffer,
        mimetype: images[1].mimeType,
        caption: `🖼️ *METADINHA — 2/2*\n💜 Use as duas para combinar!`
      }, { quoted: message });

      return;
    } catch (error) {
      return reply(`❌ Não consegui buscar as duas metadinhas.\n${error?.message || 'Tente outro tema.'}`);
    }
  }
};
