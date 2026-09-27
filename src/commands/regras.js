import { getGroupRules } from '../database/index.js';

export default {
  name: 'regras',
  aliases: ['rules'],
  category: 'groups',
  description: 'Mostra as regras do grupo.',
  async execute({ isGroup, chat, reply }) {
    if (!isGroup) return reply('❌ As regras só existem em grupos.');
    const rules = getGroupRules(chat);
    if (!rules) return reply('📜 Nenhuma regra foi configurada neste grupo ainda.');
    return reply('╭━━━〔 📜 𝐑𝐄𝐆𝐑𝐀𝐒 〕━━━╮\n' + rules + '\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯');
  }
};
