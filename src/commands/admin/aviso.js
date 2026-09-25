import { getPermissionLevel } from '../../core/permissions.js';
import { addWarning, clearWarnings, getWarnings, removeWarning } from '../../services/warnings.js';
import { resolveTargetJid } from '../../utils/targets.js';
import { getWarningConfig } from '../../database/index.js';

export default {
  name: 'warn',
  aliases: ['aviso', 'warning'],
  category: 'admin',
  description: 'Aplica, consulta ou remove avisos de um membro.',
  async execute({ sock, chat, isGroup, message, sender, args, reply }) {
    if (!isGroup) return reply('❌ Use o .warn em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem gerenciar avisos.');
    }

    const action = String(args[0] || 'add').toLowerCase();
    const target = await resolveTargetJid({ sock, chat, message });
    if (!target) return reply('❌ Marque o membro ou responda à mensagem dele.');

    if (['ver', 'view', 'status'].includes(action)) {
      const current = getWarnings(chat, target);
      const config = getWarningConfig(chat);
      return reply(
        `⚠️ *AVISOS DE @${target.split('@')[0]}*\n\n📌 Avisos: *${current.count}/${config.limit}*`,
        { mentions: [target] }
      );
    }

    if (['remover', 'remove', 'rm'].includes(action)) {
      const current = removeWarning(chat, target);
      return reply(
        `⚠️ Aviso removido de @${target.split('@')[0]}.\n📌 Avisos atuais: *${current.count}*`,
        { mentions: [target] }
      );
    }

    if (['limpar', 'clear', 'zerar'].includes(action)) {
      clearWarnings(chat, target);
      return reply(`🧹 Avisos de @${target.split('@')[0]} foram zerados.`, { mentions: [target] });
    }

    const reason = args.slice(action === 'add' ? 0 : 1).join(' ').trim() || 'Sem motivo informado';
    const current = addWarning(chat, target, reason, sender);
    const config = getWarningConfig(chat);

    if (current.count >= config.limit) {
      try {
        await sock.groupParticipantsUpdate(chat, [target], 'remove');
        clearWarnings(chat, target);
        return reply(
          `🚫 @${target.split('@')[0]} atingiu *${config.limit} avisos* e foi removido do grupo.\n📝 Motivo do último aviso: ${reason}`,
          { mentions: [target] }
        );
      } catch (error) {
        return reply(
          `⚠️ @${target.split('@')[0]} atingiu *${current.count}/${config.limit} avisos*, mas não consegui removê-lo. Verifique se o Togi é administrador do grupo.`,
          { mentions: [target] }
        );
      }
    }

    return reply(
      `⚠️ *AVISO APLICADO*\n\n👤 @${target.split('@')[0]}\n📌 Avisos: *${current.count}/${config.limit}*\n📝 Motivo: ${reason}`,
      { mentions: [target] }
    );
  }
};
