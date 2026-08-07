import { activateTogi, deactivateTogi, isTogiActive } from '../services/togi-ai.js';

export default {
  name: 'togiai',
  aliases: ['togia', 'togichat'],
  category: 'ai',
  async execute({ chat, sender, reply }) {
    if (isTogiActive(chat, sender)) {
      deactivateTogi(chat, sender);
      return reply('╭━━━〔 🤖 TOGI AI 〕━━━╮\n┃\n┃ 🔕 IA desativada!\n┃\n┃ Use .TogiAi novamente\n┃ quando quiser conversar comigo.\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯');
    }

    activateTogi(chat, sender);
    return reply('╭━━━〔 🤖 TOGI AI 〕━━━╮\n┃\n┃ ✨ IA ativada!\n┃\n┃ Agora é só mandar mensagens\n┃ normalmente para conversar comigo.\n┃\n┃ 💡 Use .TogiAi novamente\n┃ para desativar.\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯');
  }
};
