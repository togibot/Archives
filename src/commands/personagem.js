import { addTokens, ensureUser, recordGame } from '../database/index.js';

const characters = [
  ['🧙', 'Mago', 'Mestre da estratégia'], ['🕵️', 'Detetive', 'Especialista em pistas'],
  ['🤖', 'Robô', 'Precisão máxima'], ['🧭', 'Explorador', 'Sempre encontra um caminho'],
  ['⚔️', 'Herói', 'Coragem acima de tudo'], ['🧪', 'Alquimista', 'Mistura ideias improváveis'],
  ['🎮', 'Gamer', 'Nunca recusa uma partida'], ['🚀', 'Piloto', 'Vai além do limite do mapa']
];

export default {
  name: 'personagem', aliases: ['char'], category: 'arcade', description: 'Receba um personagem aleatório.',
  async execute({ sender, message, reply }) {
    ensureUser(sender, message?.pushName || 'Usuário');
    const [emoji, name, trait] = characters[Math.floor(Math.random() * characters.length)];
    addTokens(sender, 10); recordGame(sender, true, 10);
    return reply(`🎭 *PERSONAGEM ALEATÓRIO*\n\n${emoji} *${name}*\n💡 ${trait}\n\n🎁 +10 🪙`);
  }
};
