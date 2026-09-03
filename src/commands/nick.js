import { ensureUser, updateUser } from '../database/index.js';
import { getName } from '../utils/message.js';

const MAX = 40;

export default {
  name: 'nick',
  aliases: ['fig-nick', 'fignick'],
  category: 'sticker',
  description: 'Define o nome personalizado das suas figurinhas.',
  async execute({ sender, message, args, reply }) {
    ensureUser(sender, getName(message));
    const value = args.join(' ').trim();

    if (!value) {
      const user = ensureUser(sender, getName(message));
      return reply(`🏷️ *NICK DAS FIGURINHAS*\n\nAtual: *${user.sticker_nick?.trim() || 'padrão do Togi'}*\n\nUse *.nick <nome>* para configurar.\nUse *.nick off* para voltar ao nome padrão.`);
    }

    if (/^(off|reset|padrao|padrão)$/i.test(value)) {
      updateUser(sender, { sticker_nick: '' });
      return reply('💜 Nick removido! Suas próximas figurinhas voltarão a usar o nome padrão do Togi.');
    }

    if (value.length > MAX) return reply(`❌ O nick pode ter no máximo ${MAX} caracteres.`);

    updateUser(sender, { sticker_nick: value });
    return reply(`✅ *Nick configurado!*\n\n🏷️ Nome das próximas figurinhas: *${value}*`);
  }
};
