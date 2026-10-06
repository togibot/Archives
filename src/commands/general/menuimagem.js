import config from '../../config.js';

export default {
  name: 'menuimagem',
  aliases: ['imagemmenu', 'imagem'],
  category: 'geral',
  description: 'Menu de imagens e metadinhas',
  async execute({ reply }) {
    const p = config.bot.prefix;
    return reply(`╭━━━〔 🖼️💜 IMAGENS 〕━━━╮
┃
┃ 🖼️ *METADINHAS*
┃ • ${p}metadinha mm <tema> — 👦 + 👦
┃ • ${p}metadinha ff <tema> — 👧 + 👧
┃ • ${p}metadinha mf <tema> — 👦 + 👧
┃ • ${p}metadinha random <tema> — 🎲 Aleatório
┃
┃ 💡 *EXEMPLOS*
┃ • ${p}metadinha mm anime
┃ • ${p}metadinha ff dark
┃ • ${p}metadinha mf cute
┃ • ${p}metadinha random friends
┃
┃ 💜 As duas imagens são pesquisadas
┃ com a mesma busca para formar um par.
╰━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
