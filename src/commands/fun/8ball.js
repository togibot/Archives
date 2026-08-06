const answers = [
  '🔮 Sim, com certeza!',
  '✨ As chances são boas.',
  '🤔 Talvez...',
  '🌙 O futuro está incerto.',
  '❌ Provavelmente não.',
  '💀 Nem pense nisso.',
  '🍀 Tudo aponta para sim!',
  '🌀 Melhor perguntar novamente depois.'
];

export default {
  name: '8ball',
  aliases: ['bola8'],
  category: 'diversao',
  description: 'Responde uma pergunta de forma divertida',
  async execute({ args, reply }) {
    if (!args.length) return reply('🔮 Faça uma pergunta. Ex.: *.8ball vou conseguir?*');
    const answer = answers[Math.floor(Math.random() * answers.length)];
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🔮 𝟾𝙱𝙰𝙻𝙻 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n❓ *${args.join(' ')}*\n\n🎱 Resposta: *${answer}*`);
  }
};
