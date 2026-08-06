export default {
  name: 'ship',
  aliases: ['casal'],
  category: 'social',
  description: 'Calcula uma compatibilidade divertida entre duas pessoas',
  async execute({ message, args, reply }) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('💞 Marque alguém para usar o comando. Ex.: *.ship @pessoa*');
    const score = Math.floor(Math.random() * 101);
    const target = mentioned[0].split('@')[0];
    return reply(`💞 *SHIP*\n\n👤 @${message.key.participant?.split('@')[0] || 'você'} + @${target}\n\n❤️ Compatibilidade: *${score}%*`, { mentions: [message.key.participant, mentioned[0]] });
  }
};
