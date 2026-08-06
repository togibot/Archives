const jobs = [
  { name: 'Entregador', emoji: '🛵', pay: [35, 60], description: 'Entregas rápidas pela cidade.' },
  { name: 'Pescador', emoji: '🎣', pay: [45, 75], description: 'Pesque e venda sua pescaria.' },
  { name: 'Programador', emoji: '💻', pay: [60, 95], description: 'Resolva tarefas e ganhe Tokens.' },
  { name: 'Empresário', emoji: '💼', pay: [80, 120], description: 'Gerencie negócios e maximize seus ganhos.' },
  { name: 'Médico', emoji: '🩺', pay: [90, 135], description: 'Atenda pacientes e receba pelo serviço.' }
];

export { jobs };

export default {
  name: 'vagas',
  aliases: ['empregos', 'trabalhos'],
  category: 'economia',
  description: 'Mostra empregos disponíveis e seus pagamentos',
  async execute({ reply }) {
    const lines = jobs.map((job, i) => `${i + 1}. ${job.emoji} *${job.name}*\n   💰 ${job.pay[0]}–${job.pay[1]} Tokens por trabalho\n   └ ${job.description}`);
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  💼 𝚅𝙰𝙶𝙰𝚂 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\nEscolha seu emprego pelo nome ou número:\n\n${lines.join('\n\n')}\n\n💡 Use *.trabalhar <emprego>*\n📌 Limite: *3 trabalhos por dia*`);
  }
};
