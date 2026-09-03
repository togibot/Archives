import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

function normalize(value) { return String(value ?? '').trim().toLowerCase(); }

export default {
  name: 'velocidade', aliases: ['speed'], category: 'arcade', description: 'Desafio rápido de matemática.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const active = getArcadeSession(sender);
    if (active?.type === 'velocidade') {
      const answer = Number(args.join(''));
      clearArcadeSession(sender);
      if (Number.isInteger(answer) && answer === active.answer) {
        addTokens(sender, 35); recordGame(sender, true, 35);
        return reply(`⚡ *ACERTOU!*\n\n${active.a} + ${active.b} = *${active.answer}*\n🏆 +35 🪙`);
      }
      recordGame(sender, false, 0);
      return reply(`⚡ *ERROU!*\n\nA resposta era *${active.answer}*.\nTente *.velocidade* novamente!`);
    }
    const a = Math.floor(Math.random() * 90) + 10;
    const b = Math.floor(Math.random() * 90) + 10;
    setArcadeSession(sender, { type: 'velocidade', a, b, answer: a + b });
    return reply(`⚡ *VELOCIDADE*\n\nQuanto é *${a} + ${b}*?\n\n⏱️ Responda com *.velocidade <resposta>*\n🏆 Recompensa: *35 🪙*`);
  }
};
