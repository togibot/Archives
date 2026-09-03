function menu() {
  return `╭━━━〔 🧠💜 TOGI QUIZ 〕━━━╮
┃
┃ Escolha seu desafio:
┃
┃ 🌎 .quiz geral
┃ 🇧🇷 .quiz brasil
┃ 🌍 .quiz geografia
┃ 📜 .quiz historia
┃ 🔬 .quiz ciencia
┃ 🎮 .quiz games
┃ 🎬 .quiz filmes
┃ ⚽ .quiz esportes
┃ 🎵 .quiz musica
┃ 💻 .quiz tecnologia
┃ ➗ .quiz matematica
┃ 🚩 .quiz bandeiras
┃
┃ 🎲 .quiz
┃ └─ Categoria aleatória
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;
}

export default {
  name: 'quizmenu',
  aliases: ['menuquiz', 'quiz-menu'],
  category: 'fun',
  description: 'Mostra as categorias do Quiz V2.',
  async execute({ reply }) {
    return reply(menu());
  }
};
