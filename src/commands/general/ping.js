export default {
  name: 'ping',
  aliases: ['p'],
  category: 'geral',
  description: 'Verifica se o bot está online',
  async execute({ reply }) {
    const start = Date.now();
    await reply('🏓 *Pong!*');
    return undefined;
  }
};
