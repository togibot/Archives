export default {
  name: 'jogos',
  aliases: ['games', 'minigames'],
  category: 'fun',
  description: 'Mostra os minijogos disponíveis no Togi.',
  async execute({ reply }) {
    return reply(`╭━━━〔 🎮 𝐓𝐎𝐆𝐈 𝐆𝐀𝐌𝐄𝐒 〕━━━╮\n┃\n┃ 🔤 *.forca*\n┃    Descubra a palavra letra por letra.\n┃\n┃ 🔀 *.anagrama*\n┃    Desembaralhe a palavra.\n┃\n┃ 🔢 *.adivinhe*\n┃    Acerte o número secreto.\n┃\n┃ 🧠 *.quiz*\n┃    Quiz do Togi.\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n🏆 Os jogos são gratuitos e podem dar Tokens/XP como recompensa.`);
  }
};
