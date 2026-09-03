import { addTokens, ensureUser, recordQuiz } from '../database/index.js';
import { randomFlag, randomQuestion, QUIZ_CATEGORIES, normalizeCategory } from '../data/quiz.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const CATEGORY_NAMES = {
  geral: 'Conhecimentos Gerais', brasil: 'Brasil', geografia: 'Geografia', historia: 'História',
  ciencia: 'Ciência', games: 'Games', filmes: 'Filmes e Séries', esportes: 'Esportes',
  musica: 'Música', tecnologia: 'Tecnologia', matematica: 'Matemática', bandeiras: 'Bandeiras'
};

function normalizeAnswer(value = '') {
  return normalizeCategory(value).replace(/[^a-d0-9a-z]/g, '');
}

function categoryHelp() {
  return `🧠 *TOGI QUIZ V2*\n\nEscolha uma categoria:\n\n🌎 geral\n🇧🇷 brasil\n🌍 geografia\n📜 historia\n🔬 ciencia\n🎮 games\n🎬 filmes\n⚽ esportes\n🎵 musica\n💻 tecnologia\n➗ matematica\n🚩 bandeiras\n\n🎲 *.quiz* = aleatório\n📋 *.quizmenu* = menu completo`;
}

function buildChoices(correct, pool) {
  const choices = [correct];
  for (const item of pool.sort(() => Math.random() - 0.5)) {
    if (item !== correct && choices.length < 4) choices.push(item);
  }
  return choices.sort(() => Math.random() - 0.5);
}

export default {
  name: 'quiz',
  aliases: ['pergunta', 'pergunte'],
  category: 'fun',
  description: 'Quiz V2 por categorias, incluindo bandeiras.',
  async execute({ sender, message, args, reply }) {
    const user = ensureUser(sender, message?.pushName || 'Usuário');
    const active = getArcadeSession(sender);

    if (active?.type === 'quiz') {
      const answer = normalizeAnswer(args[0]);
      const index = LETTERS.indexOf(answer.toUpperCase());
      const textAnswer = normalizeAnswer(args.join(' '));
      const correct = index >= 0 ? index === active.correctIndex : textAnswer === normalizeAnswer(active.correctAnswer);
      clearArcadeSession(sender);
      const stats = recordQuiz(sender, correct);
      if (correct) {
        const gain = active.category === 'bandeiras' ? 50 : 30;
        addTokens(sender, gain);
        return reply(`🧠💜 *ACERTOU!*\n\n🎯 Categoria: *${CATEGORY_NAMES[active.category]}*\n🏆 +${gain} 🪙\n🔥 Streak: *${stats.streak}* | Melhor: *${stats.best_streak}*`);
      }
      return reply(`❌ *ERROU!*\n\nA resposta correta era *${active.correctAnswer}*.\n📊 Acertos: ${stats.correct} | Erros: ${stats.wrong}\n\nUse *.quiz* para outra rodada.`);
    }

    const requested = normalizeCategory(args[0] || '');
    if (requested === 'menu' || requested === 'ajuda' || requested === 'help') return reply(categoryHelp());

    let category = requested;
    if (!category) {
      const keys = Object.keys(QUIZ_CATEGORIES);
      category = keys[Math.floor(Math.random() * keys.length)];
    }
    if (category === 'bandeiras' || category === 'bandeira') {
      const [country, imageUrl] = randomFlag();
      const allCountries = (await import('../data/quiz.js')).FLAG_COUNTRIES.map(([name]) => name);
      const choices = buildChoices(country, allCountries);
      const correctIndex = choices.indexOf(country);
      setArcadeSession(sender, { type: 'quiz', category: 'bandeiras', correctAnswer: country, correctIndex });
      const text = `🚩 *QUIZ DE BANDEIRAS*\n\n🌎 De qual país é esta bandeira?\n\n${choices.map((c, i) => `${LETTERS[i]}) ${c}`).join('\n')}\n\nResponda com *.quiz A/B/C/D*\n🏆 Recompensa: *50 🪙*`;
      return reply({ image: { url: imageUrl }, caption: text });
    }

    if (!QUIZ_CATEGORIES[category]) return reply(`❌ Categoria não encontrada.\n\n${categoryHelp()}`);

    const [question, choices, correctIndex] = randomQuestion(category);
    setArcadeSession(sender, { type: 'quiz', category, correctAnswer: choices[correctIndex], correctIndex });
    return reply(`🧠 *TOGI QUIZ — ${CATEGORY_NAMES[category].toUpperCase()}*\n\n❓ ${question}\n\n${choices.map((c, i) => `${LETTERS[i]}) ${c}`).join('\n')}\n\nResponda com *.quiz A/B/C/D*\n🏆 Recompensa: *30 🪙*`);
  }
};
