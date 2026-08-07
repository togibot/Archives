import { getPermissionLevel } from '../../core/permissions.js';
import { setCustomWords } from '../../services/anti-palavrao.js';

export default {
  name: 'antipalavras',
  aliases: ['antipalavra'],
  category: 'admin',
  description: 'Adiciona palavras personalizadas ao filtro do grupo',
  async execute({ sock, chat, isGroup, sender, text, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem configurar o filtro.');
    const value = text.trim();
    if (!value) return reply('🛡️ Use *.antipalavras palavra1, palavra2* para adicionar palavras personalizadas.');
    const words = value.split(',').map(x => x.trim()).filter(Boolean);
    setCustomWords(chat, words);
    return reply(`🛡️ Lista personalizada atualizada!\n🚫 ${words.length} palavra(s) configurada(s).`);
  }
};
