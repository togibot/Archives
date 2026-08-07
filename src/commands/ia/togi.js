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
        const answer = await askTogi(sender, args.join(' '));
        if (!answer) return;
        return reply(`🤖 ${answer}`);
      } catch (error) {
        console.error('[TOGI AI]', error);
        return reply(
          '❌ Não consegui iniciar a IA Togi agora.\n\n' +
          '🧠 A versão atual usa IA local, sem limite de API.\n' +
          '⚙️ Verifique se o servidor local da IA está instalado/iniciado no Alpine.'
        );
      }
    }

    return reply(
      '╭━━━━━━━━━━━━━━━━━━━━╮\n' +
      '┃ 🤖  𝙏𝙊𝙂𝙄 𝘼𝙄 𝙊𝙉  ┃\n' +
      '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '👋 E AÍ! Eu sou o Togi.\n\n' +
      '🧠 Estou usando o modo de IA local.\n' +
      '📱 A IA roda no próprio aparelho, sem depender de cota de API.\n' +
      '💬 Pode conversar comigo normalmente.\n' +
      '✨ Vou manter um contexto curto da conversa.\n\n' +
      '🔴 Para desligar: *.Togioff*'
    );
  }
};
