import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

const sequences = [[2,4,8,16,32],[3,6,12,24,48],[5,10,20,40,80],[1,4,9,16,25],[2,3,5,8,13]];
const norm = v => String(v ?? '').trim().toLowerCase();

export default {
  name: 'sequencia', aliases: ['seq'], category: 'arcade', description: 'Descubra o próximo número da sequência.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const active = getArcadeSession(sender);
    if (active?.type === 'sequencia') {
      const ok = norm(args[0]) === norm(active.answer);
      clearArcadeSession(sender);
      if (ok) { addTokens(sender, 45); recordGame(sender, true, 45); return reply(`🔢 *ACERTOU!*\n\nO próximo número era *${active.answer}*.\n🏆 +45 🪙`); }
      recordGame(sender, false, 0);
      return reply(`🔢 *ERROU!*\n\nA resposta era *${active.answer}*.\nTente *.sequencia* novamente.`);
    }
    const seq = sequences[Math.floor(Math.random() * sequences.length)];
    const answer = seq.at(-1);
    setArcadeSession(sender, { type: 'sequencia', answer: String(answer) });
    return reply(`🔢 *SEQUÊNCIA*\n\n${seq.slice(0,-1).join(' → ')} → ?\n\nUse *.sequencia <número>*\n🏆 Recompensa: *45 🪙*`);
  }
};
