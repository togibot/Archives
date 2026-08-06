import { ensureUser, updateUser } from '../../database/index.js';
import { getName } from '../../utils/message.js';

export default {
  name: 'rpg',
  aliases: ['aventura'],
  category: 'rpg',
  description: 'Realiza uma aventura e recebe XP',
  async execute({ sender, message, reply }) {
    const user = ensureUser(sender, getName(message));
    const xp = 20 + Math.floor(Math.random() * 31);
    const tokens = 10 + Math.floor(Math.random() * 41);
    const nextXp = user.xp + xp;
    const newLevel = Math.floor(nextXp / 100) + 1;
    updateUser(sender, { xp: nextXp, level: newLevel, tokens: user.tokens + tokens });
    const leveled = newLevel > user.level;
    return reply(`🗺️ *AVENTURA*\n\n✨ XP ganho: *+${xp}*\n🪙 Tokens: *+${tokens}*${leveled ? `\n\n🎉 Você subiu para o nível *${newLevel}*!` : ''}`);
  }
};
