import { getPermissionLevel } from '../../core/permissions.js';

function getQuotedKey(message) {
  const context = message?.message?.extendedTextMessage?.contextInfo;
  return context?.stanzaId && (context?.participant || message?.key?.remoteJid)
    ? {
        remoteJid: message.key.remoteJid,
        fromMe: Boolean(context.participant && context.participant === message.key.participant),
        id: context.stanzaId,
        participant: context.participant
      }
    : null;
}

export default {
  name: 'd',
  aliases: ['del', 'delete'],
  category: 'admin',
  description: 'Apaga a mensagem respondida',
  async execute({ sock, chat, isGroup, message, sender, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem apagar mensagens.');

    const context = message?.message?.extendedTextMessage?.contextInfo;
    const stanzaId = context?.stanzaId;
    if (!stanzaId) return reply('❌ Responda à mensagem que deseja apagar usando *.d*.');

    const key = {
      remoteJid: chat,
      id: stanzaId,
      fromMe: false
    };
    if (context.participant) key.participant = context.participant;

    try {
      await sock.sendMessage(chat, { delete: key });
      return;
    } catch (error) {
      return reply(`❌ Não consegui apagar a mensagem.\n${error?.message || 'Erro desconhecido'}`);
    }
  }
};
