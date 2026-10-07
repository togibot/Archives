import config from '../../config.js';

export default {
  name: 'menuaudio',
  aliases: ['audio'],
  category: 'music',
  description: 'Mostra o menu de música e efeitos de áudio.',
  async execute({ reply }) {
    const p = config.bot.prefix;

    return reply(`╭━━━〔 🎵 TOGI AUDIO 〕━━━╮
┃
┃ 🎶 *MÚSICA & ÁUDIO*
┃
┣━━〔 🎧 MÚSICA 〕
┃
┃ 🎵 ${p}play <nome> — Baixar música
┃ 🔎 ${p}yts <pesquisa> — Pesquisar no YouTube
┃ 🎧 ${p}yta <nome> — Baixar áudio
┃ 📄 ${p}ytadoc <nome> — Áudio como documento
┃
┣━━〔 🔊 EFEITOS DE ÁUDIO 〕
┃
┃ 🐌 ${p}slowed — Deixar o áudio lento
┃ ⚡ ${p}speedup — Acelerar o áudio
┃ 🎵 ${p}speedmusic — Acelerar preservando o pitch
┃ 🐌 ${p}slowmusic — Deixar lento preservando o pitch
┃ 🌌 ${p}reverb <1-10> — Aplicar reverb com intensidade
┃ ✨ ${p}ultrareverb — Ultra Reverb inteligente
┃ 💧 ${p}liquid <1-10> — Efeito Digital Liquid
┃ 🎧 ${p}8d — Efeito de áudio 8D
┃
┣━━〔 🎚️ PITCH 〕
┃
┃ ⬆️ ${p}highpitch — Aumentar o pitch
┃ ⬇️ ${p}lowpitch — Diminuir o pitch
┃
┣━━〔 🔄 CONVERSÃO 〕
┃
┃ 🎵 ${p}tomp3 — Converter para MP3
┃
╰━━━━━━━━━━━━━━━━━━━━╯

💜 *Sistema de áudio do Togi Bot*
⚠️ Alguns recursos ainda estão em desenvolvimento.`); 
  }
};
