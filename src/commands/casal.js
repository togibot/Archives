function randomPair(list) {
  const firstIndex = Math.floor(Math.random() * list.length);
  let secondIndex = Math.floor(Math.random() * list.length);
  while (secondIndex === firstIndex && list.length > 1) {
    secondIndex = Math.floor(Math.random() * list.length);
  }
  return [list[firstIndex], list[secondIndex]];
}

export default {
  name: 'casal',
  aliases: [],
  category: 'social',
  description: 'Sorteia um casal do grupo',
  async execute({ sock, chat, reply }) {
    if (!chat?.endsWith('@g.us')) {
      return reply('💞 O comando *.casal* funciona apenas em grupos.');
    }

    const metadata = await sock.groupMetadata(chat);
    const participants = (metadata.participants || [])
      .map(participant => participant.id)
      .filter(Boolean);

    if (participants.length < 2) {
      return reply('💞 Preciso de pelo menos 2 pessoas no grupo para formar um casal!');
    }

    const [first, second] = randomPair(participants);
    const percentage = Math.floor(Math.random() * 101);
    const hearts = percentage >= 80 ? '💖💖💖' : percentage >= 50 ? '💕💕' : '💔';

    return reply(
      `╭━━━〔 💞 𝐂𝐀𝐒𝐀𝐋 〕━━━╮\n` +
      `┃ 👤 @${first.split('@')[0]}\n` +
      `┃ 💘 +\n` +
      `┃ 👤 @${second.split('@')[0]}\n` +
      `┃\n` +
      `┃ 💗 Compatibilidade: *${percentage}%*\n` +
      `┃ ${hearts}\n` +
      `╰━━━━━━━━━━━━━━━━━━╯`,
      { mentions: [first, second] }
    );
  }
};
