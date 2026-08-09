export default {
  name: 'beijar',
  aliases: ['beijo'],
  category: 'social',
  description: 'Envia uma mensagem de beijo virtual para uma pessoa mencionada.',
  async execute({ message, sender, reply }) {
    const target = message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target || target === sender) {
      return reply('💋 Use *.beijar @pessoa* para enviar um beijo virtual!');
    }
    return reply(`💋 @${sender.split('@')[0]} enviou um beijo virtual para @${target.split('@')[0]}!`, { mentions: [sender, target] });
  }
};
