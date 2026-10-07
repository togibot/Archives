import { getPermissionLevel } from '../core/permissions.js';

export default {
  name: 'marcar',
  aliases: ['tagall', 'todos'],
  category: 'fun',
  description: 'Marca todos os participantes do grupo.',
  async execute({ sock, chat, isGroup, message, reply, args }) {
    if (!isGroup) return reply('❌ Use o .marcar em um grupo.');

    let metadata;
    try {
      metadata = await sock.groupMetadata(chat);
    } catch (error) {
      return reply('❌ Não consegui consultar os participantes.\n' + (error?.message || 'Erro desconhecido'));
    }

    const participants = Array.isArray(metadata?.participants) ? metadata.participants : [];
    const jids = [...new Set(participants.map(p => p?.id || p?.jid || p?.lid).filter(Boolean))];
    if (!jids.length) return reply('❌ Não encontrei participantes neste grupo.');

    const content = args.join(' ').trim() || 'Chamando todo mundo! 📢';

    try {
      const chunks = [];
      let currentJids = [];
      let currentText = '📢 *『 𝙼𝙰𝚁𝙲𝙰𝙽𝙳𝙾 𝚃𝙾𝙳𝙾 𝙼𝚄𝙽𝙳𝙾 』*\n\n' + content + '\n\n';

      for (const jid of jids) {
        const number = String(jid).split('@')[0].split(':')[0];
        const mention = '@' + number;
        if ((currentText + mention + ' ').length > 60000 && currentJids.length) {
          chunks.push({ text: currentText.trim(), mentions: currentJids });
          currentJids = [];
          currentText = '📢 *『 𝙼𝙰𝚁𝙲𝙰𝙽𝙳𝙾 𝚃𝙾𝙳𝙾 𝙼𝚄𝙽𝙳𝙾 』*\n\n';
        }
        currentText += mention + ' ';
        currentJids.push(jid);
      }

      if (currentJids.length) chunks.push({ text: currentText.trim(), mentions: currentJids });
      for (const chunk of chunks) {
        await sock.sendMessage(chat, { text: chunk.text, mentions: chunk.mentions }, { quoted: message });
      }
    } catch (error) {
      return reply('❌ Não consegui marcar todos.\n' + (error?.message || 'Erro desconhecido'));
    }
  }
};