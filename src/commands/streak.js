import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

function createChallenge(streak) {
  const difficulty = Math.min(1 + Math.floor(streak / 2), 8);
  const max = 10 + difficulty * 10;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;

  if (difficulty >= 3) {
    const c = Math.floor(Math.random() * (difficulty * 3)) + 1;
    return {
      text: `${a} + ${b} × ${c}`,
      answer: a + b * c,
      difficulty
    };
  }

  return {
    text: `${a} + ${b}`,
    answer: a + b,
    difficulty
  };
}

function getTimeLimit(streak) {
  return Math.max(3000, 15000 - streak * 1000);
}

function expireMessage(streak) {
  return `⏰ *TEMPO ESGOTADO!*\n\n🔥 Sua sequência terminou em *${streak}* acerto(s).\nUse *.streak* para tentar novamente.`;
}

export default {
  name: 'streak',
  aliases: ['sequenciavitoria'],
  category: 'arcade',
  description: 'Mantenha uma sequência de acertos com dificuldade crescente.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');

    const active = getArcadeSession(sender);

    if (active?.type === 'streak') {
      const answer = Number(args[0]);

      if (answer !== active.answer) {
        clearArcadeSession(sender);
        recordGame(sender, false, active.streak);
        return reply(
          `🔥 *STREAK QUEBRADO!*\n\nSua sequência foi de *${active.streak}* acerto(s).\nUse *.streak* para começar outra.`
        );
      }

      const streak = active.streak + 1;
      const gain = 15 + streak * 10;
      const challenge = createChallenge(streak);
      const timeLimit = getTimeLimit(streak);

      addTokens(sender, gain);
      recordGame(sender, true, gain);

      setArcadeSession(
        sender,
        {
          type: 'streak',
          streak,
          answer: challenge.answer,
          difficulty: challenge.difficulty
        },
        timeLimit,
        () => reply(expireMessage(streak))
      );

      return reply(
        `🔥 *STREAK ${streak}x!*\n\n🏆 +${gain} 🪙\n📈 Dificuldade: *${challenge.difficulty}/8*\n⏱️ Tempo: *${Math.floor(timeLimit / 1000)}s*\n\nPróximo: *${challenge.text} = ?*\nUse *.streak <resposta>*`
      );
    }

    const challenge = createChallenge(0);
    const timeLimit = getTimeLimit(0);

    setArcadeSession(
      sender,
      {
        type: 'streak',
        streak: 0,
        answer: challenge.answer,
        difficulty: challenge.difficulty
      },
      timeLimit,
      () => reply(expireMessage(0))
    );

    return reply(
      `🔥 *STREAK*\n\nComeçou!\n\nQuanto é *${challenge.text}*?\n⏱️ Você tem *${Math.floor(timeLimit / 1000)}s*.\nUse *.streak <resposta>*\n💜 Cada acerto aumenta a dificuldade e o tempo diminui.`
    );
  }
};
