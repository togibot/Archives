import { getPermissionLevel } from '../core/permissions.js';
import { ensureGroup, updateGroup } from '../database/index.js';

export default {
  name: 'setd',
  aliases: ['setdespedida', 'goodbye'],
  category: 'admin',
  description: 'Configura a mensagem de despedida do grupo.',
  async execute({ sock, chat, sender, message, isGroup, text, reply }) {
    if (!isGroup) return reply('❌ Use o .setd em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar a Despedida.');
    }

    const value = String(text || '').trim();
    ensureGroup(chat);

    if (!value || /^off$/i.test(value)) {
      updateGroup(chat, { goodbye_enabled: 0, goodbye_message: '' });
      return reply('👋 *Despedida desativada neste grupo.*');
    }

    updateGroup(chat, { goodbye_enabled: 1, goodbye_message: value.slice(0, 4000) });
    return reply(
      '✅ *DESPEDIDA CONFIGURADA*\n\n' +
      'O Togi agora enviará a mensagem configurada quando alguém sair.\n\n' +
      '💡 Variáveis: {nome} e {grupo}\n' +
      '📝 Para usar a mensagem padrão novamente: *.setd off*'
    );
  }
};