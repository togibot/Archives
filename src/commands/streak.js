import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

export default {
  name: 'streak', aliases: ['sequenciavitoria'], category: 'arcade', description: 'Mantenha uma sequência de acertos.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    let active = getArcadeSession(sender);
    if (active?.type === 'streak') {
      const answer = Number(args[0]);
      if (answer !== active.answer) {
        clearArcadeSession(sender); recordGame(sender, false, active.streak);
        return reply(`🔥 *STREAK QUEBRADO!*\n\nSua sequência foi de *${active.streak}* acerto(s).\nUse *.streak* para começar outra.`);
      }
      const streak = active.streak + 1;
      const gain = 15 + streak * 10;
      addTokens(sender, gain); recordGame(sender, true, gain);
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      setArcadeSession(sender, { type: 'streak', streak, answer: a + b });
      return reply(`🔥 *STREAK ${streak}x!*\n\n🏆 +${gain} 🪙\n\nPróximo: *${a} + ${b} = ?*\nUse *.streak <resposta>*`);
    }
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    setArcadeSession(sender, { type: 'streak', streak: 0, answer: a + b });
    return reply(`🔥 *STREAK*\n\nComeçou!\n\nQuanto é *${a} + ${b}*?\nUse *.streak <resposta>*\n💜 Cada acerto aumenta a recompensa.`);
  }
};
