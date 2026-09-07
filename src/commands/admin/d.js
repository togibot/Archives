import { getPermissionLevel } from '../../core/permissions.js';

export default {
  name: 'd',
  aliases: ['del', 'delete'],
  category: 'admin',
  description: 'Apaga a mensagem respondida e o próprio comando',
  async execute({ sock, chat, isGroup, message, sender, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem apagar mensagens.');

    const context = message?.message?.extendedTextMessage?.contextInfo;
    const stanzaId = context?.stanzaId;
    if (!stanzaId) return reply('❌ Responda à mensagem que deseja apagar usando *.d*.');

    const quotedKey = {
      remoteJid: chat,
      id: stanzaId,
      fromMe: false
    };
    if (context.participant) quotedKey.participant = context.participant;

    try {
      await sock.sendMessage(chat, { delete: quotedKey });
    } catch (error) {
      return reply(`❌ Não consegui apagar a mensagem respondida.\n${error?.message || 'Erro desconhecido'}`);
    }

    try {
      await sock.sendMessage(chat, { delete: message.key });
    } catch {
      // A mensagem respondida já foi apagada; não envia uma mensagem extra.
    }
  }
};
