import { ensureUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

export default {
  name: 'perfil',
  aliases: ['profile', 'me'],
  category: 'geral',
  description: 'Mostra seu perfil',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    return reply(`👤 *PERFIL*\n\n🏷️ Nome: *${user.name}*\n🪙 Tokens: *${user.tokens.toLocaleString('pt-BR')}*\n⭐ Nível: *${user.level}*\n✨ XP: *${user.xp}*`);
  }
};
