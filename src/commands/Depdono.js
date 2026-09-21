import { getPurchaseLogs } from '../database/index.js';
import { getOwnerFund } from '../services/group-tax.js';
import { isOwnerMessage } from '../core/permissions.js';

export default {
  name: 'depdono',
  aliases: ['dep-dono','fundodono'],
  category: 'owner',
  description: 'Mostra o fundo do dono e os últimos gastos registrados.',
  async execute({ sender, message, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    const fund = getOwnerFund();
    const logs = getPurchaseLogs(10);
    const history = logs.length ? logs.map(log => {
      const purchase = String(log.action || '').startsWith('compra:') ? String(log.action).slice(7).trim() : 'Compra';
      return `👤 ${log.actorName || log.actor_jid || 'Usuário'}\n🛒 ${purchase}\n👥 ${log.groupName || log.group_name || 'Conversa privada'}\n🪙 ${Number(log.amount || 0).toLocaleString('pt-BR')} Tokens`;
    }).join('\n\n') : 'Nenhum gasto registrado ainda.';
    return reply('╭━━━〔 👑 DEP. DONO 〕━━━╮\n' +
      `┃ 🏦 Fundo: ${fund.toLocaleString('pt-BR')} Tokens\n` +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n📜 *ÚLTIMOS GASTOS*\n\n' +
      history + '\n\n💡 Use *.sacardep <quantia>* para sacar parte do fundo.');
  }
};
