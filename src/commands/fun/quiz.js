import { quizQuestions } from '../../data/catalog.js';
import { activeQuizzes } from '../../core/quiz-state.js';
import { addTokens, getUser, updateUser, recordQuiz } from '../../database/index.js';

export default {
  name: 'quiz',
  aliases: ['quizzer'],
  async execute({ sender, args, reply }) {
    if (args[0] && activeQuizzes.has(sender)) {
      const state = activeQuizzes.get(sender);
      const answer = Number(args[0]);
      activeQuizzes.delete(sender);
      const correct = answer === state.question.correct;
      const stats = recordQuiz(sender, correct);
      if (correct) {
        addTokens(sender, 100);
        const user = getUser(sender);
        const xp = user.xp + 50;
        updateUser(sender, { xp, level: Math.floor(xp / 500) + 1 });
        return reply(`🎉 ACERTOU!\n\n+🪙 100 Tokens\n+⭐ 50 XP\n🔥 Sequência: ${stats.streak}`);
      }
      return reply(`❌ ERROU!\n\nA resposta correta era a opção ${state.question.correct}.\n📊 Sequência: ${stats.streak}`);
    }

    const question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    activeQuizzes.set(sender, { question, expires: Date.now() + 30000 });
    setTimeout(() => {
      const state = activeQuizzes.get(sender);
      if (state?.question === question) activeQuizzes.delete(sender);
    }, 30000);
    const options = question.a.map((value, i) => `${i + 1}) ${value}`).join('\n');
    await reply(`╭━━━━━━━━━━━━━━━━━━╮\n┃ 🧠 𝚀𝚄𝙸𝚉 𝙳𝙾 𝚃𝙾𝙶𝙸 ┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n${question.q}\n\n${options}\n\n⏱️ 30 segundos\n💡 Responda: .quiz <número>`);
  }
};
