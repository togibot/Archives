const reactions = {
  menu: '📋',
  menueconomia: '🪙',
  menupets: '🐾',
  menuquiz: '🧠',
  menurpg: '🎮',
  menusocial: '💞',
  menugrupo: '👥',
  menumoderacao: '🛡️',
  menuadm: '🛡️',
  menubm: '⚔️',
  menufig: '🎨',
  menudiversao: '🎲',
  menuranking: '🏆',
  menueventos: '🎁',
  menumusica: '🎵',
  menuia: '🤖',
  menuvip: '👑',
  menubot: '⚙️',

  // Relacionamentos / Social
  afk: '💤', ausente: '💤', casal: '💞', ship: '❤️', namorar: '💘', aceitar: '💚', terminar: '💔',
  beijar: '💋', beijo: '💋', abracar: '🤗', abraco: '🤗', carinho: '🥰', segurarmao: '🤝', maosdadas: '🤝',
  encontro: '🌹', date: '🌹', amizade: '🤝',

  // Economia / Perfil
  trabalhar: '💰', vagas: '💼', pet: '🐾', petshop: '🐾', petinfo: '🐶', petstats: '📊', meuspets: '🐾',
  comprarpet: '🛒', loja: '🛍️', comprar: '🛒', daily: '🎁', saldo: '💰', perfil: '👤', inventario: '🎒',
  pay: '💸', pagar: '💸', rich: '💎', rank: '🏆', ranking: '🏆',

  // Jogos
  jogos: '🎮', forca: '🔤', anagrama: '🧩', adivinhe: '❓', gamestats: '📊', dado: '🎲', coin: '🪙', '8ball': '🔮', quiz: '🧠',

  // Casa coletiva
  casa: '🏠',

  // Cards / Packs
  album: '🎴', cards: '🎴', carta: '🃏', pack: '📦', abrirpack: '📦', vendercarta: '💰', doar: '🎁', doarcarta: '🎁',

  // Battle / Diversão
  tapa: '🫳', chute: '🦵', soco: '👊', empurrar: '💨', defender: '🛡️', esquivar: '💨', duelo: '⚔️',

  // Figurinhas / Música
  brath: '🎨', brats: '🎨', fig: '🎨', sticker: '🎨', musica: '🎵', play: '🎵', download: '⬇️',

  // Moderação
  antilink: '🔗', antipalavrao: '🚫', antipalavras: '🚫', kick: '👢'
};

const categoryReactions = {
  economia: '🪙', economy: '🪙', pets: '🐾', quiz: '🧠', rpg: '🎮', social: '💞', grupo: '👥', group: '👥',
  moderacao: '🛡️', admin: '🛡️', adm: '🛡️', sticker: '🎨', fig: '🎨', diversao: '🎲', fun: '🎲', ranking: '🏆',
  eventos: '🎁', musica: '🎵', music: '🎵', ia: '🤖', vip: '👑', jogos: '🎮', cards: '🎴', cartas: '🎴', casa: '🏠'
};

export function getCommandReaction(command) {
  if (!command) return null;
  const name = String(command.name || command.command || '').toLowerCase();
  if (reactions[name]) return reactions[name];
  return categoryReactions[String(command.category || '').toLowerCase()] || null;
}

export default reactions;
