import { getTogiLogs } from '../database/index.js';
import { isOwnerMessage } from '../core/permissions.js';

export default {
  name: 'logtogi',
  aliases: ['logt'],
  category: 'owner',
  description: 'Mostra os registros internos do Togi.',
  async execute({ sender, args, message, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const limit = Math.max(1, Math.min(50, Number(args[0]) || 30));
    const logs = getTogiLogs(limit);
    if (!logs.length) return reply('📜 *LOGS DO TOGI*\n\nNenhuma movimentação registrada ainda.');
    const lines = logs.map(log => `• *${log.actorName}* ${log.action} *${Number(log.amount || 0).toLocaleString('pt-BR')} Tokens* de *${log.targetName}*\n  👥 ${log.groupName || log.group_name || 'Conversa privada'}`);
    return reply(`╭━━━〔 🔐 LOG TOGI 〕━━━╮\n┃ 📜 Últimas ${logs.length} movimentações\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n${lines.join('\n\n')}`);
  }
};
