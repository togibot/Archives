import { addTokens, ensureUser, recordGame } from '../database/index.js';

const WORDS = ['togi', 'amizade', 'aventura', 'galaxia', 'criador', 'familia', 'whatsapp', 'computador', 'geometria', 'diversao'];
const sessions = new Map();
function shuffle(value) { const letters = [...value]; for (let i = letters.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; } return letters.join(''); }

export default {
  name: 'anagrama',
  aliases: ['embaralhe'],
  category: 'fun',
  description: 'Desembaralhe uma palavra e ganhe Tokens.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    let game = sessions.get(sender);
    if (!game || !args.length || ['novo', 'start', 'iniciar'].includes(args[0].toLowerCase())) {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      game = { word, scrambled: shuffle(word), attempts: 0 };
      if (game.scrambled === word) game.scrambled = shuffle(word.split('').reverse().join(''));
      sessions.set(sender, game);
      return reply(`🔀 *ANAGRAMA*\n\nDesembaralhe: *${game.scrambled.toUpperCase()}*\n\nUse *.anagrama <resposta>*.\n💡 Você pode tentar quantas vezes quiser.`);
    }
    const answer = args.join('').toLowerCase();
    if (answer === game.word) {
      const reward = Math.max(75, 175 - game.attempts * 20);
      sessions.delete(sender); addTokens(sender, reward); recordGame(sender, true, reward);
      return reply(`🎉 Acertou! Era *${game.word.toUpperCase()}*.\n🏆 Recompensa: *${reward} 🪙*`);
    }
    game.attempts++;
    if (game.attempts >= 5) {
      sessions.delete(sender); recordGame(sender, false, 0);
      return reply(`❌ Você esgotou as tentativas. A palavra era *${game.word.toUpperCase()}*.\nUse *.anagrama* para começar outra.`);
    }
    return reply(`❌ Ainda não! Tentativas restantes: *${5 - game.attempts}*.`);
  }
};
