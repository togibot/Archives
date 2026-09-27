import { getPermissionLevel } from '../core/permissions.js';

export default {
  name: 'marcar',
  aliases: ['tagall','todos','all'],
  category: 'admin',
  description: 'Menciona todos os participantes do grupo.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .marcar em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem usar o .marcar.');
    }
    const metadata = await sock.groupMetadata(chat);
    const participants = [...new Map(
      (metadata?.participants || [])
        .map(p => p?.id || p?.jid || p?.lid)
        .filter(Boolean)
        .map(jid => [String(jid), String(jid)])
    ).values()];
    if (!participants.length) return reply('❌ Não consegui obter os participantes deste grupo.');

    const text = '📢 *ATENÇÃO, GRUPO!*\n\n' + participants.map(jid => '@' + String(jid).split('@')[0]).join(' ');
    return reply(text, { mentions: participants });
  }
};
