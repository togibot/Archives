export default {
  name: 'amizade',
  aliases: ['friends', 'bff'],
  category: 'social',
  description: 'Calcula uma amizade divertida',
  async execute({ message, sender, reply }) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0];
    if (!target) return reply('🤝 Marque alguém. Ex.: *.amizade @pessoa*');
    if (target === sender) return reply('🤝 Amizade consigo mesmo: 100% garantida 😎');

    const score = Math.floor(Math.random() * 101);
    const filled = Math.round(score / 10);
    const bar = '💙'.repeat(filled) + '🤍'.repeat(10 - filled);
    return reply(`╭━━━〔 🤝 𝐀𝐌𝐈𝐙𝐀𝐃𝐄 〕━━━╮\n💙 @${sender.split('@')[0]} + @${target.split('@')[0]}\n\n${bar}\n✨ Amizade: *${score}%*\n╰━━━━━━━━━━━━━━━━━━━━╯`, { mentions: [sender, target] });
  }
};
