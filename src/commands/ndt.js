import { isOwnerMessage } from '../core/permissions.js';

async function getGroups(sock) {
  if (typeof sock.groupFetchAllParticipating !== 'function') {
    throw new Error('Não foi possível localizar os grupos conectados pelo WhatsApp.');
  }
  const groups = await sock.groupFetchAllParticipating();
  const entries = Object.values(groups || {});
  return [...new Set(entries.map(group => group?.id || group?.jid).filter(jid => String(jid).endsWith('@g.us')))];
}

export default {
  name: 'ndt',
  aliases: ['noticias', 'noticia'],
  category: 'owner',
  description: 'Envia Notícias do Togi para todos os grupos.',
  async execute({ sock, sender, message, args, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');

    const content = args.join(' ').trim();
    if (!content) return reply('❌ Use *.NDT <notícia>*');

    try {
      const groupJids = await getGroups(sock);
      if (!groupJids.length) return reply('❌ O Togi não está em nenhum grupo.');

      const announcement = '— *_NOTICIAS📰🗞️_*\\n\\n' + content;
      let sent = 0;
      let failed = 0;

      for (const jid of groupJids) {
        try {
          await sock.sendMessage(jid, { text: announcement });
          sent += 1;
        } catch {
          failed += 1;
        }
      }

      return reply('📰 *NDT ENVIADO*\\n\\n✅ Grupos enviados: *' + sent + '*\\n❌ Falhas: *' + failed + '*');
    } catch (error) {
      return reply('❌ ' + (error?.message || 'Não foi possível enviar a notícia.'));
    }
  }
};