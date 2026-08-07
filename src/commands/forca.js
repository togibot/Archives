import { addTokens, ensureUser, recordGame } from '../database/index.js';

const WORDS = ['togibot', 'whatsapp', 'amizade', 'aventura', 'galaxia', 'familia', 'criador', 'pokemon', 'geometria', 'musica'];
const sessions = new Map();

function mask(word, guessed) { return [...word].map(letter => guessed.has(letter) ? letter.toUpperCase() : '＿').join(' '); }

export default {
  name: 'forca',
  aliases: ['hangman'],
  category: 'fun',
  description: 'Jogo da forca gratuito.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    let game = sessions.get(sender);
    if (!game || ['novo', 'start', 'iniciar'].includes((args[0] || '').toLowerCase())) {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      game = { word, guessed: new Set(), wrong: 0 };
      sessions.set(sender, game);
      return reply(`🎮 *FORCA*\n\nPalavra: ${mask(word, game.guessed)}\n❌ Erros: 0/6\n\nEnvie *.forca <letra>* ou tente a palavra inteira.`);
    }
    const attempt = args.join('').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!attempt) return reply('🔤 Envie uma letra ou tente a palavra inteira.');
    if (attempt.length > 1) {
      if (attempt === game.word) {
        sessions.delete(sender); addTokens(sender, 150); recordGame(sender, true, 150);
        return reply(`🎉 Você acertou! A palavra era *${game.word.toUpperCase()}*.\n🏆 Recompensa: *150 🪙*`);
      }
      game.wrong++;
    } else if (!game.word.includes(attempt)) {
      game.wrong++;
    } else {
      game.guessed.add(attempt);
    }
    const won = [...game.word].every(letter => game.guessed.has(letter));
    if (won) {
      sessions.delete(sender); addTokens(sender, 200); recordGame(sender, true, 200);
      return reply(`🎉 Você completou a palavra *${game.word.toUpperCase()}*!\n🏆 Recompensa: *200 🪙*`);
    }
    if (game.wrong >= 6) {
      sessions.delete(sender); recordGame(sender, false, 0);
      return reply(`💀 Fim de jogo! A palavra era *${game.word.toUpperCase()}*.\nUse *.forca* para tentar novamente.`);
    }
    return reply(`🔤 *FORCA*\n\n${mask(game.word, game.guessed)}\n❌ Erros: ${game.wrong}/6`);
  }
};
