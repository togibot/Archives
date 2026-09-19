import { getGroupTax, setGroupTax, isGroupAdmin, MAX_TAX } from '../services/group-tax.js';

export default {
  name: 'imposto',
  aliases: ['taxa'],
  category: 'admin',
  description: 'Define o imposto de Tokens do grupo',
  async execute({ sock, chat, sender, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ O .imposto só pode ser usado em grupos.');

    const metadata = await sock.groupMetadata(chat);
    if (!isGroupAdmin(metadata, sender)) {
      return reply('❌ Apenas administradores do grupo podem configurar o imposto.');
    }

    const current = getGroupTax(chat);

    if (!args[0]) {
      return reply(
        '💰 *IMPOSTO DO GRUPO*\n\n' +
        '📊 Atual: *' + current + '%*\n' +
        '⚙️ Limite: *' + MAX_TAX + '%*\n\n' +
        'Use: *.imposto <0-' + MAX_TAX + '>*'
      );
    }

    if (!/^\d+$/.test(args[0])) {
      return reply('❌ Informe uma porcentagem inteira de 0 a ' + MAX_TAX + '.');
    }

    const percent = Number(args[0]);
    if (percent > MAX_TAX) {
      return reply('❌ O imposto máximo é *' + MAX_TAX + '%*.');
    }

    setGroupTax(chat, percent, metadata.subject || 'Grupo');

    if (percent === 0) return reply('✅ Imposto do grupo desativado.');

    return reply(
      '✅ Imposto do grupo definido em *' + percent + '%*.\n\n' +
      '🪙 Essa porcentagem é dividida entre os ADMs do grupo.\n' +
      '👑 O restante da compra vai para o fundo do *.Depdono*.'
    );
  }
};
