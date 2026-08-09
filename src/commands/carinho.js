export default {
  name: 'carinho',
  aliases: [],
  category: 'social',
  description: 'Envia uma mensagem de carinho para uma pessoa mencionada.',
  async execute({ message, sender, reply }) {
    const target = message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target || target === sender) {
      return reply('💜 Use *.carinho @pessoa* para enviar uma mensagem de carinho!');
    }
    const messages = [
      '💜 mandou muito carinho',
      '✨ enviou boas vibrações',
      '🌷 deixou um carinho especial',
      '🫶 mandou um gesto de amizade'
    ];
    const messageText = messages[Math.floor(Math.random() * messages.length)];
    return reply(`@${sender.split('@')[0]} ${messageText} para @${target.split('@')[0]}! 💜`, { mentions: [sender, target] });
  }
};
