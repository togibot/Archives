import { getPermissionLevel } from '../../core/permissions.js';
import { isSoAdmEnabled, setSoAdm } from '../../database/index.js';

export default {
  name: 'soadm',
  aliases: ['somenteadm'],
  category: 'admin',
  description: 'Ativa ou desativa o modo em que só ADMs usam comandos.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .soadm em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores deste grupo podem usar o .soadm.');
    }

    const enabled = !isSoAdmEnabled(chat);
    setSoAdm(chat, enabled);

    return reply(enabled
      ? '🔐 *SOADM ATIVADO*\n\nAgora somente administradores e o dono do Togi podem usar comandos neste grupo.'
      : '🔓 *SOADM DESATIVADO*\n\nTodos podem voltar a usar os comandos normalmente.');
  }
};
