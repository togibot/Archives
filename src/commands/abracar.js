export default {
  name: 'abracar',
  aliases: ['abraco'],
  category: 'social',
  description: 'Envia um abraço virtual para uma pessoa mencionada.',
  async execute({ message, sender, reply }) {
    const target = message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target || target === sender) {
      return reply('🤗 Use *.abracar @pessoa* para mandar um abraço virtual!');
    }
    return reply(`🤗 @${sender.split('@')[0]} enviou um abraço virtual para @${target.split('@')[0]}! 💜`, { mentions: [sender, target] });
  }
};
