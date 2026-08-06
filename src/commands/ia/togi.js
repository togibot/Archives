import { activateTogi, deactivateTogi } from '../../services/togi-ai.js';

export default {
  name: 'togi',
  aliases: ['togia'],
  async execute({ sender, args, reply }) {
    if (args[0]?.toLowerCase() === 'off' || args[0]?.toLowerCase() === 'desligar') {
      deactivateTogi(sender);
      return reply('╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🤖 𝙏𝙊𝙂𝙄 𝘼𝙄 𝙊𝙁𝙁 ┃\n╰━━━━━━━━━━━━━━━━━━━━╯\n\nAté depois! Quando quiser conversar comigo novamente, use *.Togi* 😎');
    }

    activateTogi(sender);

    if (args.length) {
      return reply('🤖 Só um segundo...');
    }

    return reply(
      '╭━━━━━━━━━━━━━━━━━━━━╮\n' +
      '┃ 🤖  𝙏𝙊𝙂𝙄 𝘼𝙄 𝙊𝙉  ┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '👋 E AÍ! Eu sou o Togi.\n\n' +
      '🧠 Sou a IA do Togi Bot, criado por LZ.\n' +
      '💬 Pode conversar comigo normalmente agora.\n' +
      '✨ Vou lembrar o contexto recente da nossa conversa.\n\n' +
      '🔴 Para desligar: *.Togioff*'
    );
  }
};
