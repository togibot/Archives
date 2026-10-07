import { getPermissionLevel } from '../core/permissions.js';
import { ensureGroup, updateGroup } from '../database/index.js';

export default {
  name: 'setbv',
  aliases: ['setbemvindo', 'welcome'],
  category: 'admin',
  description: 'Configura a mensagem de boas-vindas do grupo.',
  async execute({ sock, chat, sender, message, isGroup, text, reply }) {
    if (!isGroup) return reply('❌ Use o .setbv em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar o Welcome.');
    }

    const value = String(text || '').trim();
    ensureGroup(chat);

    if (!value || /^off$/i.test(value)) {
      updateGroup(chat, { welcome_enabled: 0, welcome_message: '' });
      return reply('👋 *Welcome desativado neste grupo.*');
    }

    updateGroup(chat, { welcome_enabled: 1, welcome_message: value.slice(0, 4000) });
    return reply(
      '✅ *WELCOME CONFIGURADO*\n\n' +
      'O Togi agora enviará a mensagem configurada quando alguém entrar.\n\n' +
      '💡 Variáveis: {nome} e {grupo}\n' +
      '📝 Para usar a mensagem padrão novamente: *.setbv off*'
    );
  }
};