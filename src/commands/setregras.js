import { getPermissionLevel } from '../core/permissions.js';
import { ensureGroup, updateGroup } from '../database/index.js';

export default {
  name: 'setregras',
  aliases: ['setregra'],
  category: 'admin',
  description: 'Configura as regras do grupo.',
  async execute({ sock, chat, sender, message, isGroup, text, reply }) {
    if (!isGroup) return reply('❌ Use o .setregras em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar as regras.');
    }

    const value=String(text||'').trim();
    ensureGroup(chat);
    if (!value || /^off$/i.test(value)) {
      updateGroup(chat,{rules_text:''});
      return reply('📜 *Regras removidas.* O Togi voltará a usar uma mensagem padrão.');
    }

    updateGroup(chat,{rules_text:value.slice(0,6000)});
    return reply('✅ *REGRAS CONFIGURADAS*\\n\\nUse *.regras* para visualizar as regras deste grupo.');
  }
};