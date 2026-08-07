import { activateTogi, deactivateTogi, askTogi } from '../../services/togi-ai.js';

export default {
  name: 'togi',
  aliases: ['togia', 'togioff'],
  async execute({ sender, chat, args, commandName, reply }) {
    const off = commandName === 'togioff' || ['off', 'desligar', 'stop'].includes(args[0]?.toLowerCase());
    if (off) {
      deactivateTogi(chat, sender);
      return reply('🤖 Togi AI desligada. Use *.Togi* quando quiser conversar novamente.');
    }

    activateTogi(chat, sender);

    if (!args.length) {
      return reply('🤖 *Togi AI ativada!*

Pode conversar normalmente comigo. 💬
Vou responder uma vez por mensagem, sem floodar o grupo.

🔴 Para desligar: *.Togioff*');
    }

    try {
      const answer = await askTogi(chat, sender, args.join(' '));
      if (answer) return reply(`🤖 ${answer}`);
    } catch (error) {
      console.error('[TOGI AI]', error);
      return reply('❌ A Togi AI está indisponível no momento. Tente novamente em instantes.');
    }
  }
};
