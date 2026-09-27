import { getPermissionLevel } from '../core/permissions.js';
import { setGroupRules } from '../database/index.js';

export default {
  name: 'setregras',
  aliases: ['setregrasgrupo','definirregras'],
  category: 'admin',
  description: 'Define as regras do grupo.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .setregras em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) return reply('❌ Apenas administradores podem definir as regras.');
    const rules = args.join(' ').trim();
    if (!rules) return reply('❌ Informe as regras. Ex.: .setregras 1. Respeito 2. Nada de spam');
    setGroupRules(chat, rules);
    return reply('✅ Regras do grupo atualizadas!\n\n📜 Use .regras para visualizar.');
  }
};
