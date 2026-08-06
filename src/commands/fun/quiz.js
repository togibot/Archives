import { quizQuestions } from '../../data/quiz-bank.js';
import { activeQuizzes } from '../../core/quiz-state.js';
import { addTokens, getUser, updateUser, recordQuiz } from '../../database/index.js';

const BASE_REWARD = 25;
const STREAK_STEP = 3;
const REWARD_STEP = 5;
const MAX_REWARD = 75;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareQuestion(question) {
  const options = question.a.map((text, index) => ({
    text,
    correct: index + 1 === question.correct
  }));
  const shuffled = shuffle(options);
  return {
    ...question,
    a: shuffled.map(option => option.text),
    correct: shuffled.findIndex(option => option.correct) + 1
  };
}

function pickQuestion(difficulty) {
  const pool = difficulty
    ? quizQuestions.filter(question => question.difficulty === difficulty)
    : quizQuestions;
  const source = pool.length ? pool : quizQuestions;
  return prepareQuestion(source[Math.floor(Math.random() * source.length)]);
}

function rewardForStreak(streak) {
  const bonusSteps = Math.floor(streak / STREAK_STEP);
  return Math.min(MAX_REWARD, BASE_REWARD + bonusSteps * REWARD_STEP);
}

export default {
  name: 'quiz',
  aliases: ['quizzer'],
  async execute({ sender, args, reply }) {
    const firstArg = String(args[0] || '').toLowerCase();

    if (activeQuizzes.has(sender) && /^\d+$/.test(firstArg)) {
      const state = activeQuizzes.get(sender);
      activeQuizzes.delete(sender);

      const answer = Number(firstArg);
      const correct = answer === state.question.correct;
      const stats = recordQuiz(sender, correct);

      if (correct) {
        const tokens = rewardForStreak(stats.streak);
        addTokens(sender, tokens);

        const user = getUser(sender);
        const xp = user.xp + 20;
        updateUser(sender, { xp, level: Math.floor(xp / 500) + 1 });

        const nextBonusAt = (Math.floor(stats.streak / STREAK_STEP) + 1) * STREAK_STEP;
        return reply(
          `🎉 ACERTOU!\n\n` +
          `+🪙 ${tokens} Tokens\n` +
          `+⭐ 20 XP\n` +
          `🔥 Sequência: ${stats.streak}\n` +
          `📈 Próximo aumento: ${nextBonusAt} acertos seguidos`
        );
      }

      return reply(
        `❌ ERROU!\n\n` +
        `A resposta correta era a opção ${state.question.correct}.\n` +
        `💥 Sua sequência voltou para 0.\n` +
        `📊 Melhor sequência: ${stats.best_streak}`
      );
    }

    let difficulty = null;
    if (['facil', 'fácil'].includes(firstArg)) difficulty = 'facil';
    if (['medio', 'médio'].includes(firstArg)) difficulty = 'medio';
    if (firstArg === 'dificil' || firstArg === 'difícil') difficulty = 'dificil';

    const question = pickQuestion(difficulty);
    activeQuizzes.set(sender, { question, expires: Date.now() + 30000 });

    setTimeout(() => {
      const state = activeQuizzes.get(sender);
      if (state?.question === question) {
        activeQuizzes.delete(sender);
        // Tempo esgotado também quebra a sequência.
        recordQuiz(sender, false);
      }
    }, 30000);

    const options = question.a.map((value, i) => `${i + 1}) ${value}`).join('\n');
    const difficultyLabel = {
      facil: '🟢 FÁCIL',
      medio: '🟡 MÉDIO',
      dificil: '🔴 DIFÍCIL'
    }[question.difficulty] || '🟣 MISTO';

    await reply(
      `╭━━━━━━━━━━━━━━━━━━╮\n` +
      `┃ 🧠 𝚀𝚄𝙸𝚉 𝙳𝙾 𝚃𝙾𝙶𝙸 ┃\n` +
      `╰━━━━━━━━━━━━━━━━━━╯\n\n` +
      `${difficultyLabel}\n` +
      `📚 ${question.category}\n\n` +
      `${question.q}\n\n` +
      `${options}\n\n` +
      `⏱️ 30 segundos\n` +
      `🪙 Recompensa base: ${BASE_REWARD} Tokens\n` +
      `🔥 A cada 3 acertos seguidos, a recompensa aumenta!\n\n` +
      `💡 Responda: .quiz <número>\n` +
      `🎯 Filtro: .quiz fácil | .quiz médio | .quiz difícil`
    );
  }
};
