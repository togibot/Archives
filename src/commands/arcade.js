import { addTokens, ensureUser, recordGame, getUserCards, getCardQuantity, addCard } from '../database/index.js';
import { CARDS, findCard } from '../data/cards.js';

const sessions = new Map();
const reflex = new Map();
const races = new Map();
const impostors = new Map();
const groupQuizzes = new Map();
const escapeGames = new Map();

const reward = (jid, amount, score = amount) => {
  ensureUser(jid);
  addTokens(jid, amount);
  recordGame(jid, true, score);
};

const words = [
  ['TOGI', 'T O G I'], ['BANANA', 'A A B N N A'], ['GEOMETRY', 'M E O T R Y G E'],
  ['PIXEL', 'X P I E L'], ['ARCADE', 'D A R C A E'], ['AMIZADE', 'D A M I Z A E'],
  ['VIAGEM', 'G V I A E M'], ['FANTASIA', 'A F T N A S I A'], ['MISTÉRIO', 'R I O S T É M I'],
  ['AVENTURA', 'T V A E N T U R A']
];

const quiz = [
  ['Qual planeta é conhecido como Planeta Vermelho?', ['A) Marte', 'B) Vênus', 'C) Júpiter'], 'a'],
  ['Quanto é 9 × 7?', ['A) 56', 'B) 63', 'C) 72'], 'b'],
  ['Qual é o maior oceano da Terra?', ['A) Atlântico', 'B) Índico', 'C) Pacífico'], 'c'],
  ['Qual linguagem é usada principalmente para estilizar páginas web?', ['A) CSS', 'B) SQL', 'C) Bash'], 'a'],
  ['Quantos lados tem um hexágono?', ['A) 5', 'B) 6', 'C) 8'], 'b']
];

const mysteries = [
  { clue: 'O objeto desapareceu da mesa. A janela estava fechada, a porta aberta e havia pegadas molhadas apenas perto da porta.', answer: 'porta', hint: 'A pista principal é a única saída que estava aberta.' },
  { clue: 'Três pessoas chegaram antes da chuva. Apenas uma estava com os sapatos molhados quando o objeto sumiu.', answer: 'chuva', hint: 'Pense em quem poderia ter saído durante a chuva.' },
  { clue: 'A senha foi encontrada em um papel: 2, 4, 8, 16, ?', answer: '32', hint: 'Cada número dobra.' }
];

const sequences = [[2,4,8,16,32],[3,6,12,24,48],[5,10,20,40,80],[1,4,9,16,25],[2,3,5,8,13]];
const intruders = [
  ['🍎 🍎 🍎 🍌 🍎', 'banana'], ['🐶 🐶 🐱 🐶 🐶', 'gato'], ['⭐ ⭐ 🌙 ⭐ ⭐', 'lua'],
  ['🟥 🟥 🟥 🟦 🟥', 'azul'], ['🍕 🍕 🍔 🍕 🍕', 'hambúrguer']
];

function menu() {
  return `╭━━━〔 🎮 𝐓𝐎𝐆𝐈 𝐀𝐑𝐂𝐀𝐃𝐄 〕━━━╮
┃
┃ ⚡ RÁPIDOS
┃ • .moeda  • .dado  • .alvo  • .reflexo
┃
┃ 🧠 MENTE
┃ • .adivinhe  • .anagrama  • .intruso
┃ • .sequencia  • .memoria  • .quiz
┃
┃ 🏃 VELOCIDADE
┃ • .digite  • .corrida  • .spam
┃
┃ 🕵️ MISTÉRIO
┃ • .detetive  • .codigo  • .senha  • .impostor
┃
┃ 🎴 CARTAS
┃ • .batalhacartas  • .cartasempare  • .cartadodia
┃
┃ 👥 MULTIPLAYER
┃ • .corrida  • .impostor  • .quizgrupo  • .escape
┃
┃ 💰 Jogos dão Tokens + progresso de jogo.
┃ 🎯 Use os comandos acima para jogar.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`;
}

function cardPower(card) {
  const base = { comum: 25, incomum: 40, rara: 55, epica: 70, lendaria: 85, mitica: 100, secreta: 120 };
  return (base[card.rarity] || 50) + ((card.name.length * 7) % 20);
}

export default {
  name: 'arcade',
  aliases: [
    'jogos','moeda','coin','dado','alvo','reflexo','intruso','sequencia','memoria','quiz',
    'digite','corrida','spam','detetive','codigo','senha','impostor','batalhacartas','cartasempare',
    'cartadodia','quizgrupo','escape'
  ],
  category: 'fun',
  description: 'Central de minijogos do Togi Arcade.',
  async execute({ sender, chat, args, commandName, reply }) {
    ensureUser(sender);
    const cmd = String(commandName || 'arcade').toLowerCase();

    if (cmd === 'arcade' || cmd === 'jogos') return reply(menu());

    if (cmd === 'moeda' || cmd === 'coin') {
      const side = Math.random() < 0.5 ? 'CARA' : 'COROA';
      const gain = 25 + Math.floor(Math.random() * 26);
      reward(sender, gain, gain);
      return reply(`╭━━━〔 🪙 MOEDA 〕━━━╮\n┃ A moeda girou...\n┃\n┃ ➜ *${side}!*\n┃\n┃ 🪙 +${gain} Tokens\n╰━━━━━━━━━━━━━━━━━━╯`);
    }

    if (cmd === 'dado') {
      const value = Math.floor(Math.random() * 6) + 1;
      const gain = value === 6 ? 100 : 15 + value * 5;
      reward(sender, gain, value);
      return reply(`🎲 *DADO*\n\nResultado: *${value}*\n🪙 +${gain} Tokens`);
    }

    if (cmd === 'alvo') {
      const target = Math.floor(Math.random() * 100) + 1;
      sessions.set(sender, { type: 'alvo', target });
      return reply(`🎯 *ALVO*\n\nEscolhi um número de *1 a 100*.\nTente acertar!\n\nUse *.alvo <número>*.\n💡 Quanto mais perto, maior a recompensa.`);
    }
    if (cmd === 'alvo' && sessions.get(sender)?.type === 'alvo') return null;

    if (cmd === 'reflexo') {
      const state = reflex.get(chat || sender);
      if (args[0]?.toLowerCase() === 'pronto' && state?.active) {
        const elapsed = Date.now() - state.started;
        reflex.delete(chat || sender);
        const gain = Math.max(20, 150 - Math.floor(elapsed / 30));
        reward(sender, gain, gain);
        return reply(`⚡ *REFLEXO!*\n\n⏱️ Tempo: *${elapsed}ms*\n🏆 +${gain} Tokens`);
      }
      if (state) return reply('⚡ Já existe uma rodada em andamento. Aguarde o sinal!');
      reflex.set(chat || sender, { active: false, started: 0 });
      const delay = 1800 + Math.floor(Math.random() * 3200);
      await reply('⚡ *TESTE DE REFLEXO*\n\nPrepare-se... NÃO responda ainda!');
      setTimeout(async () => {
        const current = reflex.get(chat || sender);
        if (!current) return;
        current.active = true;
        current.started = Date.now();
        try { await reply('⚡⚡⚡ *AGORA!*\nResponda *.reflexo pronto* o mais rápido possível!'); } catch {}
        setTimeout(() => { if (reflex.get(chat || sender) === current) reflex.delete(chat || sender); }, 12000);
      }, delay);
      return;
    }

    if (cmd === 'intruso') {
      const [display, answer] = intruders[Math.floor(Math.random() * intruders.length)];
      sessions.set(sender, { type: 'intruso', answer });
      return reply(`🔎 *INTRUSO*\n\n${display}\n\nQual é o intruso?\nUse *.intruso <resposta>*. `);
    }
    if (cmd === 'intruso' && sessions.get(sender)?.type === 'intruso') return null;

    if (cmd === 'sequencia') {
      const seq = sequences[Math.floor(Math.random() * sequences.length)];
      sessions.set(sender, { type: 'sequencia', answer: String(seq[seq.length - 1] * (seq[0] === 1 ? 1 : 2)) });
      const shown = seq.slice(0, -1).join(' → ');
      const answer = seq[seq.length - 1];
      sessions.set(sender, { type: 'sequencia', answer: String(answer) });
      return reply(`🧠 *SEQUÊNCIA*\n\n${shown} → ?\n\nQual é o próximo número?\nUse *.sequencia <número>*. `);
    }

    if (cmd === 'memoria') {
      const symbols = ['🟦','🟥','🟨','🟩','🟪','🟧'];
      const seq = Array.from({ length: 4 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      sessions.set(sender, { type: 'memoria', answer: seq.join('') });
      return reply(`🧠 *MEMÓRIA*\n\nMemorize esta sequência por alguns segundos:\n\n${seq.join(' ')}\n\nAgora responda: *.memoria ${seq.join('')}*`);
    }

    if (cmd === 'quiz') {
      const q = quiz[Math.floor(Math.random() * quiz.length)];
      sessions.set(sender, { type: 'quiz', answer: q[2] });
      return reply(`🧠 *QUIZ*\n\n${q[0]}\n\n${q[1].join('\n')}\n\nUse *.quiz a/b/c*.`);
    }

    if (cmd === 'digite' || cmd === 'spam') {
      const phrases = ['TOGI🔥','ARCADE⚡','LZ👑','TOKENS🪙','MEGUKA:3','GEOBR🎮'];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      sessions.set(sender, { type: cmd, answer: phrase.toLowerCase() });
      return reply(`⌨️ *${cmd === 'spam' ? 'SPAM' : 'DIGITE'}*\n\nDigite exatamente:\n\n*${phrase}*\n\nUse *.${cmd} <texto>*. `);
    }

    if (cmd === 'detetive') {
      const mystery = mysteries[Math.floor(Math.random() * mysteries.length)];
      sessions.set(sender, { type: 'detetive', answer: mystery.answer, hint: mystery.hint });
      return reply(`🕵️ *CASO DETETIVE*\n\n🔎 ${mystery.clue}\n\nQual é sua resposta?\nUse *.detetive <resposta>*. `);
    }

    if (cmd === 'codigo') {
      const codes = [['TOGI','20-15-7-9'], ['LZ','12-26'], ['ARCADE','1-18-3-1-4-5']];
      const [answer, encoded] = codes[Math.floor(Math.random() * codes.length)];
      sessions.set(sender, { type: 'codigo', answer: answer.toLowerCase() });
      return reply(`🔐 *CÓDIGO*\n\nDecifre:\n*${encoded}*\n\nA=1, B=2, C=3...\nUse *.codigo <palavra>*. `);
    }

    if (cmd === 'senha') {
      const s = sequences[Math.floor(Math.random() * sequences.length)];
      const answer = String(s[s.length - 1]);
      sessions.set(sender, { type: 'senha', answer });
      return reply(`🔑 *SENHA*\n\nPista: ${s.slice(0, -1).join(', ')}\n\nQual é a senha?\nUse *.senha <resposta>*. `);
    }

    if (cmd === 'cartadodia') {
      const day = Math.floor(Date.now() / 86400000);
      const card = CARDS.filter(c => c.status !== 'OG')[day % CARDS.filter(c => c.status !== 'OG').length];
      return reply(`🎴 *CARTA DO DIA*\n\n${card.rarity ? card.rarity.toUpperCase() : 'OG'} — *${card.name}*\n📝 ${card.description}\n\nVolte amanhã para descobrir outra carta!`);
    }

    if (cmd === 'batalhacartas') {
      const input = args.join(' ').trim();
      if (!input) return reply('🎴 Use *.batalhacartas <nome da sua carta>*.\nVocê precisa possuir a carta para participar.');
      const card = findCard(input);
      if (!card || card.status === 'OG') return reply('🎴 Essa carta não pode ser usada em uma batalha normal.');
      if (getCardQuantity(sender, card.id) < 1) return reply(`❌ Você não possui *${card.name}*.`);
      const enemyPool = CARDS.filter(c => c.status !== 'OG');
      const enemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
      const ownPower = cardPower(card);
      const enemyPower = cardPower(enemy);
      const win = ownPower >= enemyPower;
      if (win) reward(sender, 120, ownPower); else recordGame(sender, false, ownPower);
      return reply(`⚔️ *BATALHA DE CARTAS*\n\n🎴 ${card.name} — ${ownPower} ⚔️\n🆚\n🎴 ${enemy.name} — ${enemyPower} ⚔️\n\n${win ? '🏆 VOCÊ VENCEU!' : '💥 VOCÊ PERDEU!'}\n${win ? '🪙 +120 Tokens' : 'Tente outra carta!'}`);
    }

    if (cmd === 'cartasempare') {
      const cards = getUserCards(sender);
      if (cards.length < 2) return reply('🎴 Você precisa ter pelo menos *2 cartas diferentes* para jogar.');
      const first = cards[Math.floor(Math.random() * cards.length)];
      const second = cards[Math.floor(Math.random() * cards.length)];
      const match = first.card_id === second.card_id;
      if (match) reward(sender, 150, 150); else recordGame(sender, false, 0);
      return reply(`🎴 *CARTAS EM PAR*\n\n🃏 Carta 1: *${first.card_id}*\n🃏 Carta 2: *${second.card_id}*\n\n${match ? '✨ PAR ENCONTRADO! +150 Tokens' : '❌ Não formou par. Tente novamente!'}`);
    }

    if (cmd === 'corrida') {
      const key = chat || sender;
      const state = races.get(key);
      const action = (args[0] || '').toLowerCase();
      if (!state || action === 'nova' || action === 'iniciar') {
        races.set(key, { players: new Map([[sender, 0]]), started: true });
        return reply(`🏁 *CORRIDA*\n\nVocê entrou na corrida!\nOutros jogadores podem usar *.corrida entrar*.\n\nDepois use *.corrida correr* para avançar.`);
      }
      if (action === 'entrar') {
        if (!state.players.has(sender)) state.players.set(sender, 0);
        return reply(`🏃 @${sender.split('@')[0]} entrou na corrida!\nJogadores: *${state.players.size}*`, { mentions: [sender] });
      }
      if (action === 'correr') {
        if (!state.players.has(sender)) state.players.set(sender, 0);
        const step = 1 + Math.floor(Math.random() * 3);
        const pos = Math.min(10, state.players.get(sender) + step);
        state.players.set(sender, pos);
        if (pos >= 10) {
          races.delete(key); reward(sender, 300, 300);
          return reply(`🏁🏆 *CORRIDA FINALIZADA!*\n\n🥇 @${sender.split('@')[0]} chegou primeiro!\n🪙 +300 Tokens`, { mentions: [sender] });
        }
        const board = [...state.players.entries()].sort((a,b) => b[1]-a[1]).map(([jid,p]) => `@${jid.split('@')[0]} ${'█'.repeat(p)}${'░'.repeat(10-p)} (${p}/10)`).join('\n');
        return reply(`🏁 *CORRIDA*\n\n${board}\n\nUse *.corrida correr* novamente!`, { mentions: [...state.players.keys()] });
      }
      return reply('🏁 Use *.corrida entrar* ou *.corrida correr*.');
    }

    if (cmd === 'impostor') {
      const key = chat || sender;
      let state = impostors.get(key);
      const action = (args[0] || '').toLowerCase();
      if (!state || action === 'novo' || action === 'iniciar') {
        state = { players: new Set([sender]), clues: [], word: ['oceano','floresta','escola','castelo','planeta'][Math.floor(Math.random()*5)], started: false };
        impostors.set(key, state);
        return reply('🕵️ *IMPOSTOR*\n\nSala criada!\nUse *.impostor entrar* para entrar.\nO criador pode usar *.impostor iniciar* quando houver pelo menos 3 jogadores.');
      }
      if (action === 'entrar') {
        state.players.add(sender);
        return reply(`🕵️ @${sender.split('@')[0]} entrou!\n👥 Jogadores: *${state.players.size}*`, { mentions: [sender] });
      }
      if (action === 'iniciar') {
        if (state.players.size < 3) return reply('🕵️ Precisamos de pelo menos *3 jogadores*.');
        state.started = true;
        return reply(`🕵️ *PARTIDA INICIADA!*\n\nCada jogador deve mandar uma pista usando:\n*.impostor pista <pista>*\n\nDepois o grupo pode votar no suspeito.`);
      }
      if (action === 'pista' && state.started) {
        const clue = args.slice(1).join(' ').trim();
        if (!clue) return reply('Use *.impostor pista <pista>*.');
        state.clues.push({ sender, clue });
        if (state.clues.length >= state.players.size) return reply(`🕵️ Todas as pistas chegaram!\n\n${state.clues.map((c,i)=>`${i+1}. @${c.sender.split('@')[0]} — ${c.clue}`).join('\n')}\n\nAgora use *.impostor votar <número>* para votar.`, { mentions: state.clues.map(c=>c.sender) });
        return reply(`🕵️ Pista registrada! (${state.clues.length}/${state.players.size})`);
      }
      if (action === 'votar' && state.started) {
        const index = Number(args[1]) - 1;
        if (!Number.isInteger(index) || !state.clues[index]) return reply('Vote usando o número de uma das pistas exibidas.');
        const chosen = state.clues[index].sender;
        const players = [...state.players];
        const impostor = players[Math.floor(Math.random() * players.length)];
        const win = chosen === impostor;
        impostors.delete(key);
        if (win) reward(sender, 250, 250); else recordGame(sender, false, 0);
        return reply(`🕵️ *RESULTADO*\n\nSuspeito escolhido: @${chosen.split('@')[0]}\nImpostor: @${impostor.split('@')[0]}\n\n${win ? '🎉 O GRUPO ACERTOU!' : '💥 O IMPOSTOR ESCAPOU!'}${win ? '\n🪙 +250 Tokens' : ''}`, { mentions: [chosen, impostor] });
      }
      return reply('🕵️ Comandos: *.impostor entrar*, *.impostor iniciar*, *.impostor pista <texto>*, *.impostor votar <número>*.');
    }

    if (cmd === 'quizgrupo') {
      const key = chat || sender;
      let state = groupQuizzes.get(key);
      if (!state || ['novo','iniciar'].includes((args[0] || '').toLowerCase())) {
        const q = quiz[Math.floor(Math.random() * quiz.length)];
        state = { question: q[0], options: q[1], answer: q[2], players: new Set(), answers: new Map() };
        groupQuizzes.set(key, state);
        return reply(`👥🧠 *QUIZ EM GRUPO*\n\n${q[0]}\n\n${q[1].join('\n')}\n\nTodos podem responder com *.quizgrupo a*, *.quizgrupo b* ou *.quizgrupo c*.`);
      }
      const answer = (args[0] || '').toLowerCase();
      if (!['a','b','c'].includes(answer)) return reply('👥 Responda com *.quizgrupo a*, *.quizgrupo b* ou *.quizgrupo c*.');
      state.players.add(sender); state.answers.set(sender, answer);
      if (answer === state.answer) { groupQuizzes.delete(key); reward(sender, 200, 200); return reply(`🏆 @${sender.split('@')[0]} acertou primeiro!\n🪙 +200 Tokens`, { mentions: [sender] }); }
      return reply(`❌ @${sender.split('@')[0]} errou! Continue tentando.`, { mentions: [sender] });
    }

    if (cmd === 'escape') {
      const key = sender;
      let state = escapeGames.get(key);
      if (!state || ['novo','iniciar'].includes((args[0] || '').toLowerCase())) {
        state = { step: 0, answers: ['32','to gi','togi'] };
        escapeGames.set(key, state);
        return reply('🔐 *ESCAPE ROOM*\n\nVocê encontrou uma porta trancada.\n\n🔢 Enigma 1: 2 → 4 → 8 → 16 → ?\n\nUse *.escape <resposta>*.');
      }
      const answer = args.join(' ').trim().toLowerCase();
      if (answer !== state.answers[state.step]) return reply('❌ Resposta errada. Tente novamente.');
      state.step++;
      if (state.step === 1) return reply('🔓 Primeira fechadura aberta!\n\n🔐 Enigma 2: escreva *TOGI* separado por um espaço entre as letras.');
      if (state.step === 2) return reply('🔓 Segunda fechadura aberta!\n\n🚪 Último enigma: qual é o nome do bot?');
      escapeGames.delete(key); reward(sender, 500, 500);
      return reply('🚪✨ *VOCÊ ESCAPOU!*\n\n🪙 +500 Tokens\n🏆 Vitória registrada!');
    }

    const active = sessions.get(sender);
    if (active) {
      const answer = args.join(' ').trim().toLowerCase();
      if (!answer) return reply(`🎮 Responda ao desafio usando *.${cmd} <resposta>*. `);
      if (answer === String(active.answer).toLowerCase()) {
        sessions.delete(sender); reward(sender, active.type === 'senha' ? 180 : 120, 120);
        return reply(`🎉 *ACERTOU!*\n\n🏆 Desafio concluído!\n🪙 Recompensa adicionada.`);
      }
      return reply(`❌ Ainda não! Tente novamente.`);
    }

    return reply('🎮 Use *.arcade* para ver todos os jogos disponíveis.');
  }
};
