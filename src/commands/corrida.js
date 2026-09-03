import { addTokens, ensureUser, recordGame } from '../database/index.js';

const races = new Map();
const MAX = 12;

function keyFor(chat, sender) { return chat || sender; }

export default {
  name: 'corrida', aliases: ['race'], category: 'arcade', description: 'Corrida multiplayer contra o grupo.',
  async execute({ sender, chat, message, args, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const key = keyFor(chat, sender);
    const action = String(args[0] || '').toLowerCase();
    let state = races.get(key);

    if (!state || ['nova','iniciar'].includes(action)) {
      state = { owner: sender, players: new Map([[sender, 0]]), createdAt: Date.now() };
      races.set(key, state);
      return reply('🏁 *CORRIDA V2*\n\nCorrida criada!\n👥 Outros podem usar *.corrida entrar*\n🏃 Depois use *.corrida correr*\n\n📏 Primeiro a chegar em 10 vence!');
    }
    if (action === 'entrar') {
      if (state.players.has(sender)) return reply('🏁 Você já está na corrida!');
      if (state.players.size >= MAX) return reply(`🏁 Corrida cheia! Máximo: ${MAX} jogadores.`);
      state.players.set(sender, 0);
      return reply(`🏃 @${sender.split('@')[0]} entrou!\n👥 Jogadores: *${state.players.size}*`, { mentions: [sender] });
    }
    if (action === 'sair') {
      state.players.delete(sender);
      if (!state.players.size) races.delete(key);
      return reply('🏁 Você saiu da corrida.');
    }
    if (action === 'status') {
      const board = [...state.players.entries()].sort((a,b) => b[1]-a[1]).map(([jid,pos],i) => `${i+1}. @${jid.split('@')[0]} — ${pos}/10`).join('\n');
      return reply(`🏁 *CORRIDA — STATUS*\n\n${board || 'Nenhum jogador.'}`, { mentions: [...state.players.keys()] });
    }
    if (action === 'correr') {
      if (!state.players.has(sender)) state.players.set(sender, 0);
      const step = 1 + Math.floor(Math.random() * 3);
      const pos = Math.min(10, state.players.get(sender) + step);
      state.players.set(sender, pos);
      if (pos >= 10) {
        races.delete(key); addTokens(sender, 150); recordGame(sender, true, 150);
        return reply(`🏁🏆 *FIM DA CORRIDA!*\n\n🥇 @${sender.split('@')[0]} venceu!\n🪙 +150 Tokens`, { mentions: [sender] });
      }
      const board = [...state.players.entries()].sort((a,b) => b[1]-a[1]).map(([jid,p]) => `@${jid.split('@')[0]} — ${'█'.repeat(p)}${'░'.repeat(10-p)} ${p}/10`).join('\n');
      return reply(`🏁 *CORRIDA*\n\n${board}\n\n🏃 @${sender.split('@')[0]} avançou *+${step}*!\nUse *.corrida correr*`, { mentions: [...state.players.keys()] });
    }
    return reply('🏁 Use *.corrida entrar*, *.corrida correr*, *.corrida status* ou *.corrida sair*.');
  }
};
