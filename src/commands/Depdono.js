import config from '../config.js';
import { addTokens } from '../database/index.js';
import { claimOwnerFund, getOwnerFund } from '../services/group-tax.js';

function ownerJids() {
  return (config.owner?.numbers || [])
    .map(String)
    .filter(Boolean)
    .map(v => v.includes('@') ? v : v + '@s.whatsapp.net');
}

export default {
  name: 'depdono',
  aliases: ['dep-dono', 'fundodono'],
  category: 'admin',
  description: 'Consulta e saca o fundo do dono',
  async execute({ sender, args, reply }) {
    if (!ownerJids().includes(String(sender))) {
      return reply('❌ Apenas o dono do Togi pode usar este comando.');
    }

    const fund = getOwnerFund();

    if (args[0]?.toLowerCase() === 'sacar') {
      if (fund <= 0) return reply('🏦 O fundo do dono está vazio.');

      const amount = claimOwnerFund();
      addTokens(sender, amount);

      return reply(
        '💜 *DEP. DONO*\n\n' +
        '🪙 ' + amount.toLocaleString('pt-BR') +
        ' Tokens foram adicionados ao seu saldo.'
      );
    }

    return reply(
      '╭━━━〔 👑 DEP. DONO 〕━━━╮\n' +
      '┃ 🏦 Fundo acumulado\n' +
      '┃ 🪙 ' + fund.toLocaleString('pt-BR') + ' Tokens\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '💡 Use *.Depdono sacar* para transferir o fundo para seu saldo.'
    );
  }
};
