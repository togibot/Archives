import { ensureUser, getPetSettings, setPetNotifications } from '../database/index.js';

export default {
  name: 'petnotify',
  aliases: ['petnotifications', 'notificapet'],
  category: 'pets',
  description: 'Ativa, desativa ou consulta as notificações dos Pets.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const option = String(args?.[0] || 'status').trim().toLowerCase();
    const current = getPetSettings(sender);

    if (['on', 'sim', 'ativar', 'ativado', '1'].includes(option)) {
      setPetNotifications(sender, true);
      return reply('🔔 Notificações dos Pets **ATIVADAS**!\n🐾 Você será mencionado quando uma habilidade automática for ativada.');
    }

    if (['off', 'nao', 'não', 'desativar', 'desativado', '0'].includes(option)) {
      setPetNotifications(sender, false);
      return reply('🔕 Notificações dos Pets **DESATIVADAS**!\n🐾 As habilidades continuam funcionando normalmente.');
    }

    const enabled = Number(current?.notifications_enabled) === 1;
    return reply('🔔 **Notificações dos Pets**\n\n' +
      '📌 Status: ' + (enabled ? '🟢 Ativadas' : '🔴 Desativadas') + '\n' +
      '💡 Use .petnotify on para ativar.\n' +
      '💡 Use .petnotify off para desativar.');
  }
};
