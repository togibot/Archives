import config from '../config.js';
import { getTogiLogs } from '../database/index.js';

function normalize(value) {
  return String(value || '').split('@')[0].replace(/\D/g, '');
}

function isOwner(sender) {
  const current = normalize(sender);
  return config.owner.numbers.map(normalize).filter(Boolean).includes(current);
}

function formatTokens(amount) {
  return Number(amount || 0).toLocaleString('pt-BR');
}

export default {
  name: 'logtogi',
  aliases: ['logt'],
  category: 'owner',
  description: 'Mostra os registros internos do Togi.',
  async execute({ sender, args, reply }) {
    if (!isOwner(sender)) return;

    const limit = Math.max(1, Math.min(50, Number(args[0]) || 30));
    const logs = getTogiLogs(limit);

    if (!logs.length) {
      return reply('📜 *LOGS DO TOGI*\n\nNenhuma movimentação registrada ainda.');
    }

    const lines = logs.map((log) => {
      const action = log.action === 'roubo' ? 'Roubou' : log.action;
      return `• *${log.actorName}* ${action} *${formatTokens(log.amount)} Tokens* de *${log.targetName}*\n  👥 ${log.groupName}`;
    });

    return reply(
      `╭━━━〔 🔐 LOG TOGI 〕━━━╮
┃ 📜 Últimas ${logs.length} movimentações
╰━━━━━━━━━━━━━━━━━━━━━━╯

${lines.join('\n\n')}`
    );
  }
};
