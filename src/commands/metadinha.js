import { buildMetadinhaQueries, getMetadinhaOptions } from '../services/metadinha.js';

export default {
  name: 'metadinha',
  aliases: ['matchingpfp'],
  category: 'fun',
  description: 'Pesquisa metadinhas por tema e combinação.',
  async execute({ reply, args }) {
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

💜 O sistema vai pesquisar pares de fotos de perfil combinando.`);
    }

    const [rawType, ...themeParts] = input.split(' ');
    const type = ['mm', 'ff', 'mf', 'random'].includes(rawType.toLowerCase())
      ? rawType.toLowerCase()
      : 'random';

    const theme = type === 'random' && rawType === input ? input : (themeParts.join(' ') || (type === 'random' ? input : 'anime'));
    const queries = buildMetadinhaQueries(theme, type);

    return reply(`🖼️ *METADINHA*

🎯 Tipo: *${getMetadinhaOptions().find(x => x.key === type)?.label || 'Aleatório'}*
🎨 Tema: *${theme}*

🔎 Vou pesquisar por:
• ${queries.join('\n• ')}

⚠️ O sistema de busca automática está sendo preparado para usar apenas fontes públicas compatíveis.`);
  }
};
