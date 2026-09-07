import { getPermissionLevel } from '../../core/permissions.js';
import { addWarning, clearWarnings, getWarnings, removeWarning } from '../../services/warnings.js';

function getTarget(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    || message?.message?.extendedTextMessage?.contextInfo?.participant
    || null;
}

export default {
  name: 'aviso',
  aliases: ['warn', 'warning'],
  category: 'admin',
  description: 'Adiciona, remove ou consulta avisos de um membro',
  async execute({ sock, chat, isGroup, message, sender, args, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem gerenciar avisos.');

    const action = String(args[0] || 'add').toLowerCase();
    const target = getTarget(message);
    if (!target) return reply('❌ Marque o membro ou responda à mensagem dele.');

    if (['ver', 'view', 'status'].includes(action)) {
      const current = getWarnings(chat, target);
      return reply(`⚠️ *AVISOS DE @${target.split('@')[0]}*\n\n📌 Avisos: *${current.count}*`, { mentions: [target] });
    }

    if (['remover', 'remove', 'rm'].includes(action)) {
      const current = removeWarning(chat, target);
      return reply(`⚠️ Aviso removido de @${target.split('@')[0]}.\n📌 Avisos atuais: *${current.count}*`, { mentions: [target] });
    }

    if (['limpar', 'clear', 'zerar'].includes(action)) {
      clearWarnings(chat, target);
      return reply(`🧹 Avisos de @${target.split('@')[0]} foram zerados.`, { mentions: [target] });
    }

    const reason = args.slice(1).join(' ').trim() || 'Sem motivo informado';
    const current = addWarning(chat, target, reason, sender);
    return reply(`⚠️ *AVISO APLICADO*\n\n👤 @${target.split('@')[0]}\n📌 Avisos: *${current.count}*\n📝 Motivo: ${reason}\n\n⚠️ Ao atingir 3 avisos, o membro poderá ser removido.`, { mentions: [target] });
  }
};
