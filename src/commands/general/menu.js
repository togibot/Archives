import config from '../../config.js';
const line='━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
export default { name:'menu', aliases:['help','ajuda','m'], category:'geral', description:'Menu principal', async execute({reply}){ const p=config.bot.prefix; return reply(`╭${line}╮
┃ ✨ 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 𝐀𝐎 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 ✨
┃ 🤖 𝚃 𝙾 𝙶 𝙸 • 𝙱 𝙾 𝚃
╰${line}╯

┏━━ 📂 𝐌𝐄𝐍𝐔𝐒 ━━━━━━━━━━━━━━━━━━━┓
┃ 🪙 ${p}menueconomia • Economia
┃ 🎮 ${p}menurpg • RPG
┃ 💞 ${p}menusocial • Social
┃ 👥 ${p}menugrupo • Grupos
┃ 🛡️ ${p}menuadm • Administração
┃ 🎨 ${p}menufig • Figurinhas
┃ 🎲 ${p}menudiversao • Diversão
┃ 🏆 ${p}menuranking • Ranking
┃ 🧠 ${p}menuquiz • Quiz
┃ 🎁 ${p}menueventos • Eventos
┃ 🎵 ${p}menumusica • Música
┃ 🤖 ${p}menuia • IA
┃ 👑 ${p}menuvip • VIP
┃ ⚙️ ${p}menubot • Bot
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

💼 *TRABALHO*
${p}vagas • Ver empregos e pagamentos
${p}trabalhar <emprego> • Trabalhar
💤 ${p}afk • Ativar AFK
📌 Limite de trabalho: *3 vezes por dia*

╭${line}╮
┃ 🪙 Moeda: *Token*
┃ 🔥 Versão: *Togi Bot v${config.bot.version}*
┃ 👑 Criador: *LZ*
┃ ⭐ SubDonos: *Lkz • Unc.*
╰${line}╯`); }};
