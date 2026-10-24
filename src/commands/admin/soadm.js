import { getPermissionLevel, isOwnerMessage } from '../../core/permissions.js';
import { clearAllSoAdm, isSoAdmEnabled, setSoAdm } from '../../database/index.js';

export default {
  name: 'soadm',
  aliases: ['somenteadm'],
  category: 'admin',
  description: 'Ativa ou desativa o modo em que só ADMs usam comandos.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .soadm em um grupo.');

    const action = String(args?.[0] || '').trim().toLowerCase();

    if (['offall', 'reset', 'resetall'].includes(action)) {
      if (!isOwnerMessage(message, sender)) {
        return reply('❌ Apenas o dono do Togi pode resetar o SOADM de todos os grupos.');
      }

      const changed = clearAllSoAdm();
      return reply(`🔓 *SOADM RESETADO*\n\nDesativado em ${changed} grupo(s). Todos os grupos voltaram a aceitar comandos normalmente.`);
    }

    const permission = await getPermissionLevel({ sock, chat, jid: sender, message });
    if (permission < 3) {
      return reply('❌ Apenas administradores deste grupo podem usar o .soadm.');
    }

    const current = isSoAdmEnabled(chat);

    if (!action || action === 'status') {
      return reply(
        `🔐 *SOADM:* ${current ? 'ATIVADO' : 'DESATIVADO'}\n\n` +
        'Use *.soadm on* para ativar ou *.soadm off* para desativar.'
      );
    }

    if (!['on', 'off', 'ativar', 'desativar'].includes(action)) {
      return reply('❌ Use *.soadm on*, *.soadm off* ou *.soadm status*.');
    }

    const enabled = action === 'on' || action === 'ativar';
    setSoAdm(chat, enabled);

    return reply(enabled
      ? '🔐 *SOADM ATIVADO*\n\nSomente administradores e o dono do Togi podem usar comandos neste grupo.'
      : '🔓 *SOADM DESATIVADO*\n\nTodos podem voltar a usar os comandos normalmente.');
  }
};
