export default {
  name: 'jogos',
  aliases: ['games', 'minigames'],
  category: 'fun',
  description: 'Mostra os jogos disponíveis no Togi.',
  async execute({ reply }) {
    return reply(`╭━━━〔 🎮 𝐓𝐎𝐆𝐈 𝐆𝐀𝐌𝐄𝐒 〕━━━╮
┃
┃ 🔤 *.forca*
┃    Descubra a palavra letra por letra.
┃
┃ 🔀 *.anagrama*
┃    Desembaralhe a palavra.
┃
┃ 🔢 *.adivinhe*
┃    Acerte o número secreto.
┃
┃ 🧠 *.quiz*
┃    Quiz do Togi.
┃
┃ 🔥 *.doom*
┃    Jogue Freedoom em 3D no navegador.
┃    Inclui controles touch e áudio.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

🏆 Os minijogos de texto podem dar Tokens/XP.
🎮 DOOM abre uma partida no navegador.`);
  }
};
