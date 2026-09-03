import { addTokens, ensureUser, recordGame } from '../database/index.js';
import { getArcadeSession, setArcadeSession, clearArcadeSession } from '../services/arcade-sessions.js';

const riddles = [
  ['Tenho cidades, mas não tenho casas; montanhas, mas não tenho árvores. O que sou?', 'mapa'],
  ['Quanto mais você tira, maior eu fico. O que sou?', 'buraco'],
  ['Tenho mãos, mas não posso bater palmas. O que sou?', 'relogio']
];
const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

export default {
  name: 'misterio', aliases: ['mystery'], category: 'arcade', description: 'Resolva uma charada.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const active = getArcadeSession(sender);
    if (active?.type === 'misterio') {
      const ok = norm(args.join(' ')) === norm(active.answer);
      if (ok) { clearArcadeSession(sender); addTokens(sender, 50); recordGame(sender, true, 50); return reply(`🕵️ *MISTÉRIO RESOLVIDO!*\n\n🏆 +50 🪙`); }
      return reply('🕵️ Ainda não! Tente outra resposta ou use *.misterio dica*.');
    }
    if (norm(args[0]) === 'dica' && active?.type === 'misterio') return reply(`💡 *DICA:* ${active.hint}`);
    const [question, answer] = riddles[Math.floor(Math.random() * riddles.length)];
    const hint = answer === 'mapa' ? 'É usado para localizar lugares.' : answer === 'buraco' ? 'Ele cresce quando algo é retirado.' : 'É um objeto que marca as horas.';
    setArcadeSession(sender, { type: 'misterio', answer, hint });
    return reply(`🕵️ *MISTÉRIO*\n\n${question}\n\nUse *.misterio <resposta>*\n💡 Pode pedir *.misterio dica*\n🏆 Recompensa: *50 🪙*`);
  }
};
