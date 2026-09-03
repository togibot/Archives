const CATEGORY = {
  menu: ['📖','MENU'], fun: ['🎮','DIVERSÃO / ARCADE'], cards: ['🎴','TOGI CARDS'], pet: ['🐾','PETS'], economy: ['🪙','ECONOMIA'],
  social: ['💞','SOCIAL / RELACIONAMENTO'], status: ['💤','STATUS'], admin: ['🛡️','GRUPOS / MODERAÇÃO'], music: ['🎵','MÚSICA'], stickers: ['🎨','FIGURINHAS'], ai: ['🤖','TOGI AI'], house: ['🏠','CASA']
};

function getCategory(command) {
  const raw=String(command?.category||'fun').toLowerCase();
  if(['fig','figurinhas','sticker','stickers'].includes(raw))return'stickers';
  if(['economia','eco'].includes(raw))return'economy';
  if(['pets','pet'].includes(raw))return'pet';
  if(['admin','adm','moderation','mod'].includes(raw))return'admin';
  if(['social','relacionamento','relationship','rp'].includes(raw))return'social';
  if(['status'].includes(raw))return'status';
  if(['music','musica'].includes(raw))return'music';
  if(['ai','ia'].includes(raw))return'ai';
  if(['casa','house'].includes(raw))return'house';
  if(['cards','card'].includes(raw))return'cards';
  if(['menu'].includes(raw))return'menu';
  return'fun';
}
function buildMenu(commands) {
  const unique=new Map();
  for(const command of commands?.values?.()||[]) if(command?.name) unique.set(command.name,command);
  const groups=new Map();
  for(const command of unique.values()){const key=getCategory(command);if(key==='menu')continue;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(command);}
  const order=['fun','cards','pet','house','social','status','economy','stickers','music','ai','admin'];
  const sections=[];
  for(const key of order){const list=(groups.get(key)||[]).sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'));if(!list.length)continue;const [emoji,title]=CATEGORY[key]||['📌',key.toUpperCase()];const lines=list.map(c=>`┃ ${emojiFor(c.name)} .${c.name} — ${String(c.description||'Comando do Togi.').replace(/\s+/g,' ').trim()}`);sections.push(`${emoji} *${title}*\n${lines.join('\n')}`);}
  return `╭━━━〔 💜🤖 𝐓𝐎𝐆𝐈 𝐁𝐎𝐓 𝐕𝟐 〕━━━╮\n┃ ✨ *MENU COMPLETO*\n┃ Todos os comandos e o que cada um faz.\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n${sections.join('\n\n')}\n\n🎵 *MÚSICA: 🧪 EM TESTE / BETA*\n┃ O sistema de música ainda está em desenvolvimento.\n\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃ 💜 *TOGI BOT V2*\n┃ 👑 Criador: *LZ*\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}
function emojiFor(name){const n=String(name).toLowerCase();const map={menu:'📖',arcade:'🎮',quiz:'🧠',rank:'🏅',ranks:'🏆',cards:'🃏',card:'🎴',album:'📚',casa:'🏠',pet:'🐶',petshop:'🛒',meuspets:'🐾',petinfo:'📋',petstats:'📊',saldo:'💰',daily:'🎁',weekly:'📅',trabalhar:'💼',loja:'🏪',comprar:'🛒',pagar:'💸',play:'🎧',s:'🖼️',sticker:'🖼️',take:'🏷️',nick:'🏷️',perfilfig:'👤',packs:'📦',antilink:'🔗',antipalavrao:'🚫',kick:'👢',d:'🗑️',afk:'💤', 'afk-off':'👋',TogiAi:'🤖',adivinhe:'🎯',anagrama:'🔤',alvo:'🎯',velocidade:'⚡',sequencia:'🧩',misterio:'❓',memoria:'🧠',streak:'🔥',corrida:'🏁',codigo:'🔐',personagem:'🎭',brat:'📝'};return map[name]||map[n]||'•';}

export default {
  name:'menu', aliases:['m','ajuda','help','inicio'], category:'menu', description:'Mostra todos os comandos do Togi com suas funções.',
  async execute({reply,commands}) { return reply(buildMenu(commands)); }
};
