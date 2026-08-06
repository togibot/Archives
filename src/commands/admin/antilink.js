import { getPermissionLevel } from '../../core/permissions.js';
import { ensureGroup } from '../../database/index.js';

export default {
  name: 'antilink',
  aliases: ['anti-link'],
  category: 'admin',
  description: 'Ativa ou desativa o anti-link do grupo',
  async execute({ sock, chat, isGroup, args, sender, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem alterar essa configuração.');
    const mode = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(mode)) return reply('⚙️ Use *.antilink on* ou *.antilink off*.');
    const group = ensureGroup(chat);
    const value = mode === 'on' ? 1 : 0;
    const { default: dbModule } = await import('../../database/index.js');
    void dbModule;
    return reply(`🔗 Anti-link ${group.antilink === value ? 'já estava' : 'foi'} definido como *${mode.toUpperCase()}*.`);
  }
};
