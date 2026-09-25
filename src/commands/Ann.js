import { isOwnerMessage } from '../core/permissions.js';

export default {
  name: 'ann',
  aliases: ['anuncio', 'comunicado'],
  category: 'owner',
  description: 'Envia um comunicado dos donos para todos os grupos.',
  async execute({ sock, sender, message, args, reply }) {
    if (!isOwnerMessage(message, sender)) {
      return reply('❌ Apenas o dono do Togi pode usar este comando.');
    }

    const announcement = args.join(' ').trim();
    if (!announcement) {
      return reply('❌ Use *.Ann <mensagem>*');
    }

    if (typeof sock.groupFetchAllParticipating !== 'function') {
      return reply('❌ Não foi possível localizar os grupos conectados pelo WhatsApp.');
    }

    const groups = await sock.groupFetchAllParticipating();
    const entries = Object.values(groups || {});
    const groupJids = [...new Set(entries.map(group => group?.id || group?.jid).filter(jid => String(jid).endsWith('@g.us')))];

    if (!groupJids.length) {
      return reply('❌ O Togi não está em nenhum grupo.');
    }

    const text =
      '*COMUNICADO DOS DONOS DO TOGI:*\n\n' +
      announcement;

    let sent = 0;
    let failed = 0;

    for (const jid of groupJids) {
      try {
        await sock.sendMessage(jid, { text });
        sent += 1;
      } catch (error) {
        failed += 1;
        console.log(`⚠️ Falha no Ann em ${jid}: ${error?.message || 'erro desconhecido'}`);
      }
    }

    return reply(
      '📢 *ANN ENVIADO*\n\n' +
      `✅ Grupos enviados: *${sent}*\n` +
      `❌ Falhas: *${failed}*`
    );
  }
};
