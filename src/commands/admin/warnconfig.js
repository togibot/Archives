import { getPermissionLevel } from '../../core/permissions.js';
import { getWarningConfig, setWarningConfig } from '../../database/index.js';

export default {
  name: 'warnconfig',
  aliases: ['warnlimite'],
  category: 'admin',
  description: 'Define quantos avisos causam expulsão.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .warnconfig em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar os avisos.');
    }

    if (!args[0]) {
      const cfg = getWarningConfig(chat);
      return reply(`⚙️ *WARN CONFIG*\n\n🔢 Limite atual: *${cfg.limit} avisos*\n⏳ Validade: *${cfg.timeoutMs ? 'configurada em .warntempo' : 'sem expiração'}*`);
    }

    if (!/^\d+$/.test(args[0])) return reply('❌ Informe um número inteiro de 1 a 20.');
    const value = Number(args[0]);
    if (value < 1 || value > 20) return reply('❌ O limite precisa ficar entre 1 e 20 avisos.');

    const cfg = setWarningConfig(chat, value);
    return reply(`✅ Limite de avisos definido para *${cfg.limit}*. Ao atingir esse número, o membro será removido.`);
  }
};
