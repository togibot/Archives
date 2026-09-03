import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

export default {
  name: 'alvo', aliases: ['target'], category: 'arcade', description: 'Acerte o número secreto de 1 a 100.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    let active = getArcadeSession(sender);
    if (!active || active.type !== 'alvo') {
      const target = Math.floor(Math.random() * 100) + 1;
      setArcadeSession(sender, { type: 'alvo', target, attempts: 0 });
      return reply('🎯 *ALVO*\n\nPensei em um número de *1 a 100*.\nUse *.alvo <número>* para tentar.\n🏆 Até *100 🪙* pelo acerto.');
    }
    const guess = Number(args[0]);
    if (!Number.isInteger(guess) || guess < 1 || guess > 100) return reply('🎯 Digite um número inteiro entre *1 e 100*.');
    active.attempts++;
    if (guess === active.target) {
      const gain = Math.max(25, 100 - active.attempts * 10);
      clearArcadeSession(sender); addTokens(sender, gain); recordGame(sender, true, gain);
      return reply(`🎯 *ACERTOU!*\n\nEra *${active.target}*. Você precisou de *${active.attempts}* tentativa(s).\n🏆 +${gain} 🪙`);
    }
    if (active.attempts >= 8) {
      const target = active.target; clearArcadeSession(sender); recordGame(sender, false, 0);
      return reply(`🎯 Fim da rodada! O número era *${target}*.\nTente *.alvo* para uma nova rodada.`);
    }
    setArcadeSession(sender, active);
    const hint = guess < active.target ? 'maior' : 'menor';
    return reply(`🎯 Quase! O alvo é *${hint}* que ${guess}.\n📌 Tentativas: *${active.attempts}/8*`);
  }
};
