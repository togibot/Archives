import config from '../../config.js';

export default {
  name: 'menu',
  aliases: ['help', 'ajuda', 'm'],
  category: 'geral',
  description: 'Menu principal do Togi Bot',
  async execute({ reply }) {
    const p = config.bot.prefix;

    return reply(`╭━━━〔 💜 TOGI BOT 〕━━━╮
┃
┃ Oii, <@USER>! :D
┃ Seja bem-vindo(a) ao Togi!
┃
┃ Eu tô aqui pra deixar seu grupo
┃ mais divertido, com jogos, economia,
┃ eventos, música e muito mais. 💜
┃
┣━━〔 💜 MENU PRINCIPAL 〕
┃
┃ 💰 ${p}menueconomia — Economia
┃ 🐾 ${p}menupets — Pets
┃ 🧠 ${p}menuquiz — Quiz
┃ 🎭 ${p}menurpg — RP & Relações
┃ ⚔️ ${p}menubm — Battle Mode
┃ 👥 ${p}menugrupo — Grupos
┃ 🎨 ${p}menufig — Figurinhas
┃ 🎲 ${p}menudiversao — Diversão
┃ 🎵 ${p}menuaudio — Áudios & Música
┃
┣━━〔 ✦ OUTROS 〕
┃
┃ 🏆 ${p}menuranking — Rankings
┃ 🎁 ${p}menueventos — Eventos
┃ 🧠 ${p}menuia — Inteligência
┃ 👑 ${p}menuvip — VIP
┃ ⚙️ ${p}menubot — Informações
┃
╰━━━━━━━━━━━━━━━━━━━━╯

💜 *Use um dos menus acima pra começar!*

╭━━〔 TOGI BOT 〕━━╮
┃ 🪙 Moeda: *Token*
┃ ✦ Versão: *${config.bot.version}*
┃ 👑 Criador: *LZ*
┃ ⭐ SubDonos: *Lkz • Unc.*
╰━━━━━━━━━━━━━━━╯`);
  }
};
