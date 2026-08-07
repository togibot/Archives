import { addTokens, ensureUser, recordGame } from '../database/index.js';

const sessions = new Map();

export default {
  name: 'adivinhe',
  aliases: ['numero', 'guess'],
  category: 'fun',
  description: 'Adivinhe um número de 1 a 50.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    let game = sessions.get(sender);
    if (!game || ['novo', 'start', 'iniciar'].includes((args[0] || '').toLowerCase())) {
      game = { number: Math.floor(Math.random() * 50) + 1, attempts: 0 };
      sessions.set(sender, game);
      return reply('🔢 *ADIVINHE O NÚMERO*\n\nPensei em um número de *1 a 50*.\nVocê tem *7 tentativas*.\n\nUse *.adivinhe <número>*.');
    }
    const guess = Number(args[0]);
    if (!Number.isInteger(guess) || guess < 1 || guess > 50) return reply('🔢 Digite um número inteiro entre *1 e 50*.');
    game.attempts++;
    if (guess === game.number) {
      const reward = Math.max(50, 250 - (game.attempts - 1) * 25);
      sessions.delete(sender); addTokens(sender, reward); recordGame(sender, true, reward);
      return reply(`🎉 ACERTOU! O número era *${game.number}*.\n🏆 Recompensa: *${reward} 🪙*`);
    }
    if (game.attempts >= 7) {
      sessions.delete(sender); recordGame(sender, false, 0);
      return reply(`❌ Acabaram as tentativas! O número era *${game.number}*.\nUse *.adivinhe* para jogar novamente.`);
    }
    const hint = guess < game.number ? '⬆️ O número é maior.' : '⬇️ O número é menor.';
    return reply(`❌ Errou! ${hint}\n🎯 Tentativas restantes: *${7 - game.attempts}*.`);
  }
};
