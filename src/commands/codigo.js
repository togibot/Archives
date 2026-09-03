import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

const codes = [
  ['TOGI', '20-15-7-9'], ['ARCADE', '1-18-3-1-4-5'], ['TOKI', '20-15-11-9'],
  ['LUA', '12-21-1'], ['BRASIL', '2-18-1-19-9-12']
];
const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

export default {
  name: 'codigo', aliases: ['code'], category: 'arcade', description: 'Decifre o código secreto.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const active = getArcadeSession(sender);
    if (active?.type === 'codigo') {
      if (norm(args.join(' ')) === norm(active.answer)) {
        clearArcadeSession(sender); addTokens(sender, 75); recordGame(sender, true, 75);
        return reply(`🔐 *CÓDIGO DECIFRADO!*\n\n🏆 +75 🪙`);
      }
      return reply('🔐 Código incorreto. Tente novamente ou use *.codigo dica*.');
    }
    if (args[0]?.toLowerCase() === 'dica' && active?.type === 'codigo') return reply(`💡 DICA: ${active.answer.length} letras.`);
    const [answer, encoded] = codes[Math.floor(Math.random() * codes.length)];
    setArcadeSession(sender, { type: 'codigo', answer });
    return reply(`🔐 *CÓDIGO*\n\nDecifre:\n*${encoded}*\n\nA=1, B=2, C=3...\nUse *.codigo <palavra>*\n🏆 Recompensa: *75 🪙*`);
  }
};
