import config from '../../config.js';

const line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

export default {
  name: 'menu',
  aliases: ['help', 'ajuda', 'm'],
  category: 'geral',
  description: 'Exibe o menu principal do Togi Bot',
  async execute({ reply }) {
    const p = config.bot.prefix;
    return reply(`╭${line}╮
┃                                                                              ┃
┃           ✨  𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 𝐀𝐎  𝐌𝐄𝐍𝐔 𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋  ✨           ┃
┃                                                                              ┃
┃                 🤖 • 𝚃 𝙾 𝙶 𝙸   𝙱 𝙾 𝚃 • 🤖                 ┃
┃                                                                              ┃
╰${line}╯

┏${line}┓
┃                      📂 𝐓𝐎𝐃𝐎𝐒 𝐎𝐒 𝐌𝐄𝐍𝐔𝐒 𝐃𝐈𝐒𝐏𝐎𝐍𝐈́𝐕𝐄𝐈𝐒                      ┃
┣${line}┫
┃                                                                              ┃
┃   🪙  ${p}menueconomia   ║  Riquezas, Moedas e Comércio 💸💰               ┃
┃   🐾  ${p}menupets       ║  Seus Bichinhos e Companheiros 🐕🐈✨           ┃
┃   🧠  ${p}menuquiz       ║  Desafios, Perguntas e Conhecimento 📚🧩        ┃
┃   🎮  ${p}menurpg        ║  Aventuras, Batalhas e Magia ⚔️🛡️🗡️             ┃
┃   💞  ${p}menusocial     ║  Amizades, Carinho e Relacionamentos ❤️🤝        ┃
┃   👥  ${p}menugrupo      ║  Comandos Gerais para o Grupo 🏠📢               ┃
┃   🛡️  ${p}menumoderacao  ║  Segurança, Regras e Controle 🔒⚖️🚫             ┃
┃   🎨  ${p}menufig        ║  Figurinhas, Artes e Edições 🖼️🎨✏️             ┃
┃   🎲  ${p}menudiversao   ║  Jogos, Piadas e Muita Zueira 🎉🎊🎮             ┃
┃   🏆  ${p}menuranking    ║  Os Mais Fortes e Melhores 📈🥇📊                ┃
┃   🎁  ${p}menueventos    ║  Novidades, Prêmios e Datas Especiais 🎀🎊      ┃
┃   🎵  ${p}menumusica     ║  Música e Recursos de Áudio 🎶🎧🎤              ┃
┃   🤖  ${p}menuia         ║  Inteligência, Dúvidas e Respostas 🧠💡📜        ┃
┃   👑  ${p}menuvip        ║  Vantagens e Benefícios Exclusivos ✨💎👑         ┃
┃                                                                              ┃
┃         ⚙️  ${p}menubot      ║  Dados, Versão e Configurações ℹ️📋              ┃
┃                                                                              ┃
┗${line}┛

╭${line}╮
┃                                                                              ┃
┃      🪙  𝐌𝐨𝐞𝐝𝐚 𝐎𝐟𝐢𝐜𝐢𝐚𝐥:  𝐓𝐨𝐤𝐞𝐧  💎                                      ┃
┃      🔥  𝐕𝐞𝐫𝐬𝐚̃𝐨:  𝐓𝐨𝐠𝐢  𝐁𝐨𝐭  ─  𝐯${config.bot.version}                             ┃
┃      👑  𝐂𝐫𝐢𝐚𝐝𝐨𝐫:  𝐋𝐙                                                      ┃
┃      ⭐  𝐒𝐮𝐛𝐃𝐨𝐧𝐨𝐬:  𝐋𝐤𝐳  •  𝐔𝐧𝐜. (nome a confirmar)                      ┃
┃                                                                              ┃
╰${line}╯`);
  }
};
