import config from '../config.js';
import { getPurchaseLogs } from '../database/index.js';
import { getOwnerFund } from '../services/group-tax.js';

function normalizeNumber(value) {
  return String(value || '')
    .split('@')[0]
    .replace(/\D/g, '');
}

function isOwner(...values) {
  const allowedNumbers = config.owner.numbers
    .map(normalizeNumber)
    .filter(Boolean);

  return values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map(normalizeNumber)
    .filter(Boolean)
    .some((number) => allowedNumbers.includes(number));
}

export default {
  name: 'depdono',
  aliases: ['dep-dono', 'fundodono'],
  category: 'owner',
  description: 'Mostra o fundo do dono e os últimos gastos registrados.',
  async execute({ sender, message, reply }) {
    const key = message?.key || {};
    const candidates = [
      sender,
      key.participant,
      key.participantAlt,
      key.participantPn,
      key.senderPn,
      key.remoteJid,
      key.remoteJidAlt,
      message?.participant,
      message?.participantAlt,
      message?.senderPn,
      message?.sender?.id,
      message?.sender?.phoneNumber
    ];

    if (!isOwner(candidates)) {
      return reply('❌ Apenas o dono do Togi pode usar este comando.');
    }

    const fund = getOwnerFund();
    const logs = getPurchaseLogs(10);

    const history = logs.length
      ? logs.map(log => {
          const purchase = String(log.action || '').startsWith('compra:')
            ? String(log.action).slice('compra:'.length).trim()
            : 'Compra';
          return (
            `👤 ${log.actorName || log.actor_jid || 'Usuário'}\n` +
            `🛒 ${purchase}\n` +
            `👥 ${log.groupName || 'Conversa privada'}\n` +
            `🪙 ${Number(log.amount || 0).toLocaleString('pt-BR')} Tokens`
          );
        }).join('\n\n')
      : 'Nenhum gasto registrado ainda.';

    return reply(
      '╭━━━〔 👑 DEP. DONO 〕━━━╮\n' +
      `┃ 🏦 Fundo: ${fund.toLocaleString('pt-BR')} Tokens\n` +
      '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '📜 *ÚLTIMOS GASTOS*\n\n' +
      history +
      '\n\n💡 Use *.sacardep <quantia>* para sacar parte do fundo.'
    );
  }
};
