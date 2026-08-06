import { activateTogi, deactivateTogi, askTogi } from '../../services/togi-ai.js';

export default {
  name: 'togi',
  aliases: ['togia', 'togioff'],
  async execute({ sender, args, reply }) {
    if (args[0]?.toLowerCase() === 'off' || args[0]?.toLowerCase() === 'desligar' || args[0]?.toLowerCase() === 'stop') {
      deactivateTogi(sender);
      return reply('╭━━━━━━━━━━━━━━━━━━━━╮\n┃ 🤖 𝙏𝙊𝙂𝙄 𝘼𝙄 𝙊𝙁𝙁 ┃\n╰━━━━━━━━━━━━━━━━━━━━╯\n\nAté depois! Quando quiser conversar comigo novamente, use *.Togi* 😎');
    }

    activateTogi(sender);

    if (args.length) {
      try {
        return reply(`🤖 ${await askTogi(sender, args.join(' '))}`);
      } catch (error) {
        return reply('❌ Não consegui acessar a IA agora. Verifique se GEMINI_API_KEY está configurada no .env.');
      }
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
