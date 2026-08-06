import { ensureUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';
import config from '../../config.js';

export default {
  name: 'saldo',
  aliases: ['bal', 'balance'],
  category: 'economia',
  description: 'Mostra seu saldo de Tokens',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    return reply(`💰 *SALDO*\n\n👤 ${user.name}\n${config.economy.currency} *${user.tokens.toLocaleString('pt-BR')} ${config.economy.name}*`);
  }
};
