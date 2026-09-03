import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

const symbols = ['🟦','🟥','🟨','🟩','🟪','🟧'];
const norm = v => String(v ?? '').replace(/\s+/g,'').trim();

export default {
  name: 'memoria', aliases: ['memory'], category: 'arcade', description: 'Memorize e repita uma sequência.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const active = getArcadeSession(sender);
    if (active?.type === 'memoria') {
      const ok = norm(args.join('')) === norm(active.answer);
      clearArcadeSession(sender);
      if (ok) { addTokens(sender, 60); recordGame(sender, true, 60); return reply(`🧠 *MEMÓRIA PERFEITA!*\n\nVocê repetiu a sequência corretamente.\n🏆 +60 🪙`); }
      recordGame(sender, false, 0);
      return reply(`🧠 *ERROU!*\n\nA sequência correta era:\n*${active.answer.split('').join(' ')}*\n\nTente *.memoria* novamente.`);
    }
    const length = 4 + Math.floor(Math.random() * 3);
    const seq = Array.from({ length }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    setArcadeSession(sender, { type: 'memoria', answer: seq.join('') });
    return reply(`🧠 *MEMÓRIA*\n\nMemorize:\n\n*${seq.join(' ')}*\n\nDepois responda usando:\n*.memoria <sequência>*\n🏆 Recompensa: *60 🪙*`);
  }
};
