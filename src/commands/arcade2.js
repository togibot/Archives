import { addTokens, ensureUser, recordGame, getUserCards, getCardQuantity } from '../database/index.js';
import { CARDS, findCard } from '../data/cards.js';

const sessions = new Map();
const reflex = new Map();
const races = new Map();
const impostors = new Map();
const groupQuizzes = new Map();
const escapes = new Map();

const win = (jid, tokens = 100, score = tokens) => { ensureUser(jid); addTokens(jid, tokens); recordGame(jid, true, score); };
const lose = (jid, score = 0) => recordGame(jid, false, score);

const quiz = [
  ['Qual planeta é conhecido como Planeta Vermelho?', ['A) Marte','B) Vênus','C) Júpiter'], 'a'],
  ['Quanto é 9 × 7?', ['A) 56','B) 63','C) 72'], 'b'],
  ['Qual é o maior oceano da Terra?', ['A) Atlântico','B) Índico','C) Pacífico'], 'c'],
  ['Qual linguagem estiliza páginas web?', ['A) CSS','B) SQL','C) Bash'], 'a']
];
const sequences = [[2,4,8,16,32],[3,6,12,24,48],[5,10,20,40,80],[1,4,9,16,25],[2,3,5,8,13]];
const intruders = [['🍎 🍎 🍎 🍌 🍎','banana'],['🐶 🐶 🐱 🐶 🐶','gato'],['⭐ ⭐ 🌙 ⭐ ⭐','lua'],['🟥 🟥 🟥 🟦 🟥','azul']];
const mysteries = [
  ['A janela estava fechada, a porta aberta e havia pegadas molhadas apenas perto da porta. Por onde alguém saiu?','porta'],
  ['Uma pessoa apareceu com os sapatos molhados durante uma chuva. Qual fenômeno explica isso?','chuva'],
  ['A sequência 2, 4, 8, 16, ? continua com qual número?','32']
];

const arcadeMenu = `╭━━━〔 🎮 𝐓𝐎𝐆𝐈 𝐀𝐑𝐂𝐀𝐃𝐄 〕━━━╮
┃
┃ ⚡ RÁPIDOS
┃ • .moeda • .dado • .alvo • .reflexo
┃
┃ 🧠 MENTE
┃ • .adivinhe • .anagrama • .intruso
┃ • .sequencia • .memoria • .quiz
┃
┃ 🏃 VELOCIDADE
┃ • .digite • .corrida • .spam
┃
┃ 🕵️ MISTÉRIO
┃ • .detetive • .codigo • .senha • .impostor
┃
┃ 🎴 CARTAS
┃ • .batalhacartas • .cartasempare • .cartadodia
┃
┃ 👥 MULTIPLAYER
┃ • .corrida • .impostor • .quizgrupo • .escape
┃
┃ 🪙 Todos os jogos registram progresso.
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

function power(card) {
  const base = { comum:25, incomum:40, rara:55, epica:70, lendaria:85, mitica:100, secreta:120 };
  return (base[card.rarity] || 50) + ((card.name.length * 7) % 20);
}

export default {
  name: 'arcade',
  aliases: ['jogos','moeda','coin','dado','alvo','reflexo','intruso','sequencia','memoria','quiz','digite','corrida','spam','detetive','codigo','senha','impostor','batalhacartas','cartasempare','cartadodia','quizgrupo','escape'],
  category: 'fun',
  description: 'Central de minijogos do Togi.',
  async execute({ sender, chat, args, commandName, reply }) {
    ensureUser(sender);
    const cmd = String(commandName || 'arcade').toLowerCase();
    const answer = args.join(' ').trim().toLowerCase();

    if (cmd === 'arcade' || cmd === 'jogos') return reply(arcadeMenu);

    // Jogos de sessão: primeiro verifica uma resposta pendente.
    const pending = sessions.get(sender);
    if (pending && pending.type === cmd && answer) {
      const ok = answer === String(pending.answer).toLowerCase();
      if (ok) {
        sessions.delete(sender);
        win(sender, pending.type === 'memoria' ? 180 : 120);
        return reply(`🎉 *ACERTOU!*\n\n🏆 Desafio concluído!\n🪙 Recompensa adicionada.`);
      }
      return reply('❌ Ainda não! Tente novamente.');
    }

    if (cmd === 'moeda' || cmd === 'coin') {
      const side = Math.random() < .5 ? 'CARA' : 'COROA';
      const tokens = 25 + Math.floor(Math.random() * 26);
      win(sender, tokens); return reply(`╭━━━〔 🪙 MOEDA 〕━━━╮\n┃ A moeda girou...\n┃ ➜ *${side}!*\n┃ 🪙 +${tokens} Tokens\n╰━━━━━━━━━━━━━━━━━━╯`);
    }
    if (cmd === 'dado') {
      const value = 1 + Math.floor(Math.random() * 6); const tokens = value === 6 ? 100 : 15 + value * 5;
      win(sender, tokens, value); return reply(`🎲 *DADO*\n\nResultado: *${value}*\n🪙 +${tokens} Tokens`);
    }
    if (cmd === 'alvo') {
      const old = sessions.get(sender);
      if (old?.type === 'alvo' && args.length) {
        const guess = Number(args[0]);
        if (!Number.isInteger(guess) || guess < 1 || guess > 100) return reply('🎯 Digite um número entre 1 e 100.');
        if (guess === old.answer) { sessions.delete(sender); win(sender, 200); return reply('🎯 *ACERTOU O ALVO!*\n🪙 +200 Tokens'); }
        const diff = Math.abs(guess - old.answer); return reply(`❌ Errou! Está ${guess < old.answer ? 'mais acima' : 'mais abaixo'}.\n📏 Distância: ${diff}`);
      }
      const target = 1 + Math.floor(Math.random() * 100); sessions.set(sender, { type:'alvo', answer:target });
      return reply('🎯 *ALVO*\n\nEscolhi um número de *1 a 100*.\nUse *.alvo <número>* para tentar.');
    }
    if (cmd === 'reflexo') {
      const key = chat || sender; const state = reflex.get(key);
      if (answer === 'pronto' && state?.active) { const ms = Date.now() - state.started; reflex.delete(key); const tokens = Math.max(20, 150 - Math.floor(ms / 30)); win(sender, tokens); return reply(`⚡ *REFLEXO!*\n⏱️ *${ms}ms*\n🪙 +${tokens} Tokens`); }
      if (state) return reply(state.active ? '⚡ O sinal já apareceu! Use *.reflexo pronto*!' : '⚡ Aguarde o sinal!');
      const next = { active:false, started:0 }; reflex.set(key,next); await reply('⚡ *TESTE DE REFLEXO*\n\nNão responda ainda...');
      setTimeout(async () => { if (!reflex.has(key)) return; next.active=true; next.started=Date.now(); try { await reply('⚡⚡⚡ *AGORA!*\n*.reflexo pronto*'); } catch {} setTimeout(() => { if (reflex.get(key)===next) reflex.delete(key); },12000); },1800+Math.floor(Math.random()*3000));
      return;
    }
    if (cmd === 'intruso') {
      const old = sessions.get(sender); if (old?.type === 'intruso' && answer) { if (answer===old.answer) { sessions.delete(sender); win(sender,120); return reply('🔎🎉 *ACHOU O INTRUSO!*\n🪙 +120 Tokens'); } return reply('❌ Não é esse.'); }
      const item=intruders[Math.floor(Math.random()*intruders.length)]; sessions.set(sender,{type:'intruso',answer:item[1]}); return reply(`🔎 *INTRUSO*\n\n${item[0]}\n\nQual é o intruso?\nUse *.intruso <resposta>*. `);
    }
    if (cmd === 'sequencia') {
      const old=sessions.get(sender); if(old?.type==='sequencia'&&answer){if(answer===old.answer){sessions.delete(sender);win(sender,120);return reply('🧠🎉 *SEQUÊNCIA CORRETA!*\n🪙 +120 Tokens');}return reply('❌ Sequência incorreta.');}
      const seq=sequences[Math.floor(Math.random()*sequences.length)]; sessions.set(sender,{type:'sequencia',answer:String(seq.at(-1))}); return reply(`🧠 *SEQUÊNCIA*\n\n${seq.slice(0,-1).join(' → ')} → ?\n\nUse *.sequencia <número>*. `);
    }
    if (cmd === 'memoria') {
      const old=sessions.get(sender); if(old?.type==='memoria'&&answer){if(answer.replace(/\s+/g,'')===old.answer.replace(/\s+/g,'')){sessions.delete(sender);win(sender,180);return reply('🧠✨ *MEMÓRIA PERFEITA!*\n🪙 +180 Tokens');}return reply('❌ Sequência errada.');}
      const symbols=['🟦','🟥','🟨','🟩','🟪','🟧']; const seq=Array.from({length:4},()=>symbols[Math.floor(Math.random()*symbols.length)]).join(''); sessions.set(sender,{type:'memoria',answer:seq}); return reply(`🧠 *MEMÓRIA*\n\nMemorize:\n*${seq.split('').join(' ')}*\n\nDepois use *.memoria <sequência>*. `);
    }
    if (cmd === 'quiz') {
      const old=sessions.get(sender); if(old?.type==='quiz'&&answer){if(answer===old.answer){sessions.delete(sender);win(sender,150);return reply('🧠🏆 *ACERTOU!*\n🪙 +150 Tokens');}return reply('❌ Alternativa errada.');}
      const q=quiz[Math.floor(Math.random()*quiz.length)]; sessions.set(sender,{type:'quiz',answer:q[2]}); return reply(`🧠 *QUIZ*\n\n${q[0]}\n\n${q[1].join('\n')}\n\nUse *.quiz a/b/c*.`);
    }
    if (cmd === 'digite' || cmd === 'spam') {
      const old=sessions.get(sender); if(old?.type===cmd&&answer){if(answer===old.answer){sessions.delete(sender);win(sender,100);return reply(`⌨️🎉 *PERFEITO!*\n🪙 +100 Tokens`);}return reply('❌ Não ficou igual.');}
      const phrases=['TOGI🔥','ARCADE⚡','LZ👑','TOKENS🪙','MEGUKA:3','GEOBR🎮']; const phrase=phrases[Math.floor(Math.random()*phrases.length)]; sessions.set(sender,{type:cmd,answer:phrase.toLowerCase()}); return reply(`⌨️ *${cmd.toUpperCase()}*\n\nDigite exatamente:\n*${phrase}*\n\nUse *.${cmd} <texto>*. `);
    }
    if (cmd === 'detetive') {
      const old=sessions.get(sender); if(old?.type==='detetive'&&answer){if(answer.includes(old.answer)){sessions.delete(sender);win(sender,180);return reply('🕵️🎉 *CASO RESOLVIDO!*\n🪙 +180 Tokens');}return reply('❌ Essa não é a solução.');}
      const m=mysteries[Math.floor(Math.random()*mysteries.length)]; sessions.set(sender,{type:'detetive',answer:m[1]}); return reply(`🕵️ *CASO DETETIVE*\n\n${m[0]}\n\nUse *.detetive <resposta>*. `);
    }
    if (cmd === 'codigo') {
      const old=sessions.get(sender); if(old?.type==='codigo'&&answer){if(answer===old.answer){sessions.delete(sender);win(sender,180);return reply('🔐🎉 *CÓDIGO DECIFRADO!*\n🪙 +180 Tokens');}return reply('❌ Código incorreto.');}
      const codes=[['togi','20-15-7-9'],['lz','12-26'],['arcade','1-18-3-1-4-5']]; const c=codes[Math.floor(Math.random()*codes.length)]; sessions.set(sender,{type:'codigo',answer:c[0]}); return reply(`🔐 *CÓDIGO*\n\n*${c[1]}*\n\nA=1, B=2...\nUse *.codigo <palavra>*. `);
    }
    if (cmd === 'senha') {
      const old=sessions.get(sender); if(old?.type==='senha'&&answer){if(answer===old.answer){sessions.delete(sender);win(sender,180);return reply('🔑🎉 *SENHA DESCOBERTA!*\n🪙 +180 Tokens');}return reply('❌ Senha incorreta.');}
      const s=sequences[Math.floor(Math.random()*sequences.length)]; sessions.set(sender,{type:'senha',answer:String(s.at(-1))}); return reply(`🔑 *SENHA*\n\nPista: ${s.slice(0,-1).join(', ')}\n\nUse *.senha <resposta>*. `);
    }
    if (cmd === 'cartadodia') {
      const pool=CARDS.filter(c=>c.status!=='OG'); const card=pool[Math.floor(Date.now()/86400000)%pool.length]; return reply(`🎴 *CARTA DO DIA*\n\n${card.rarity?.toUpperCase()} — *${card.name}*\n📝 ${card.description}`);
    }
    if (cmd === 'batalhacartas') {
      const card=findCard(args.join(' ')); if(!card||card.status==='OG') return reply('🎴 Use *.batalhacartas <nome da carta>* com uma carta normal.');
      if(getCardQuantity(sender,card.id)<1) return reply(`❌ Você não possui *${card.name}*.`);
      const pool=CARDS.filter(c=>c.status!=='OG'); const enemy=pool[Math.floor(Math.random()*pool.length)]; const base={comum:25,incomum:40,rara:55,epica:70,lendaria:85,mitica:100,secreta:120}; const a=(base[card.rarity]||50)+card.name.length; const b=(base[enemy.rarity]||50)+enemy.name.length;
      if(a>=b) win(sender,120,a); else lose(sender,a); return reply(`⚔️ *BATALHA DE CARTAS*\n\n🎴 ${card.name} — ${a}\n🆚\n🎴 ${enemy.name} — ${b}\n\n${a>=b?'🏆 VOCÊ VENCEU!\n🪙 +120 Tokens':'💥 VOCÊ PERDEU!'}`);
    }
    if (cmd === 'cartasempare') {
      const cards=getUserCards(sender); if(cards.length<2) return reply('🎴 Você precisa de pelo menos 2 cartas diferentes.'); const a=cards[Math.floor(Math.random()*cards.length)]; const b=cards[Math.floor(Math.random()*cards.length)]; const same=a.card_id===b.card_id; if(same)win(sender,150);else lose(sender); return reply(`🎴 *CARTAS EM PAR*\n\n🃏 ${a.card_id}\n🃏 ${b.card_id}\n\n${same?'✨ PAR! +150 Tokens':'❌ Não formou par.'}`);
    }
    if (cmd === 'corrida') {
      const key=chat||sender; let r=races.get(key); const action=(args[0]||'').toLowerCase();
      if(!r||action==='nova'||action==='iniciar'){r={players:new Map([[sender,0]])};races.set(key,r);return reply('🏁 *CORRIDA CRIADA!*\n\nUse *.corrida entrar* para entrar.\nUse *.corrida correr* para avançar.');}
      if(action==='entrar'){r.players.set(sender,r.players.get(sender)||0);return reply(`🏃 @${sender.split('@')[0]} entrou! (${r.players.size} jogadores)`,{mentions:[sender]});}
      if(action==='correr'){if(!r.players.has(sender))r.players.set(sender,0);const p=Math.min(10,r.players.get(sender)+1+Math.floor(Math.random()*3));r.players.set(sender,p);const board=[...r.players].sort((a,b)=>b[1]-a[1]).map(([j,n])=>`@${j.split('@')[0]} ${'█'.repeat(n)}${'░'.repeat(10-n)}`).join('\n');if(p>=10){races.delete(key);win(sender,300);return reply(`🏁🏆 @${sender.split('@')[0]} chegou primeiro!\n🪙 +300 Tokens`,{mentions:[sender]});}return reply(`🏁 *CORRIDA*\n\n${board}\n\nUse *.corrida correr* novamente.`,{mentions:[...r.players.keys()]});}
      return reply('🏁 Use *.corrida entrar* ou *.corrida correr*.');
    }
    if (cmd === 'impostor') {
      const key=chat||sender; let s=impostors.get(key); const action=(args[0]||'').toLowerCase();
      if(!s||action==='novo'){s={players:new Set([sender]),clues:[],started:false};impostors.set(key,s);return reply('🕵️ *IMPOSTOR*\n\nSala criada. Use *.impostor entrar* e depois *.impostor iniciar*.');}
      if(action==='entrar'){s.players.add(sender);return reply(`🕵️ @${sender.split('@')[0]} entrou! (${s.players.size})`,{mentions:[sender]});}
      if(action==='iniciar'){if(s.players.size<3)return reply('🕵️ Precisamos de pelo menos 3 jogadores.');s.started=true;return reply('🕵️ Partida iniciada! Cada jogador usa *.impostor pista <texto>*.');}
      if(action==='pista'&&s.started){const clue=args.slice(1).join(' ');if(!clue)return reply('Use *.impostor pista <texto>*.');s.clues.push({sender,clue});if(s.clues.length<s.players.size)return reply(`🕵️ Pista registrada (${s.clues.length}/${s.players.size}).`);return reply(`🕵️ Todas as pistas chegaram!\n\n${s.clues.map((x,i)=>`${i+1}. @${x.sender.split('@')[0]} — ${x.clue}`).join('\n')}\n\nVote com *.impostor votar <número>*.`,{mentions:s.clues.map(x=>x.sender)});}
      if(action==='votar'&&s.started){const i=Number(args[1])-1;if(!s.clues[i])return reply('Escolha um número de pista válido.');const players=[...s.players];const imp=players[Math.floor(Math.random()*players.length)];const chosen=s.clues[i].sender;const ok=chosen===imp;impostors.delete(key);if(ok)win(sender,250);else lose(sender);return reply(`🕵️ *RESULTADO*\n\nSuspeito: @${chosen.split('@')[0]}\nImpostor: @${imp.split('@')[0]}\n\n${ok?'🎉 ACERTOU! +250 Tokens':'💥 O impostor escapou!'}`,{mentions:[chosen,imp]});}
      return reply('🕵️ Use: entrar, iniciar, pista <texto> ou votar <número>.');
    }
    if (cmd === 'quizgrupo') {
      const key=chat||sender; let s=groupQuizzes.get(key); const a=(args[0]||'').toLowerCase();
      if(!s||a==='novo'||a==='iniciar'){const q=quiz[Math.floor(Math.random()*quiz.length)];s={answer:q[2]};groupQuizzes.set(key,s);return reply(`👥🧠 *QUIZ EM GRUPO*\n\n${q[0]}\n\n${q[1].join('\n')}\n\n*.quizgrupo a/b/c*`);}
      if(!['a','b','c'].includes(a))return reply('Responda com a, b ou c.');if(a===s.answer){groupQuizzes.delete(key);win(sender,200);return reply(`🏆 @${sender.split('@')[0]} acertou primeiro!\n🪙 +200 Tokens`,{mentions:[sender]});}return reply('❌ Errou!');
    }
    if (cmd === 'escape') {
      let s=escapes.get(sender); if(!s||['novo','iniciar'].includes((args[0]||'').toLowerCase())){s={step:0};escapes.set(sender,s);return reply('🚪 *ESCAPE ROOM*\n\nEnigma 1: 2 → 4 → 8 → 16 → ?\n\nUse *.escape <resposta>*.');}
      if(!answer)return reply('Use *.escape <resposta>*.'); const expected=['32','togi','togi'][s.step];if(answer!==expected)return reply('❌ Resposta errada.');s.step++;if(s.step===1)return reply('🔓 1ª fechadura!\n\nEnigma 2: qual é o nome do bot?');if(s.step===2)return reply('🔓 2ª fechadura!\n\nEnigma 3: escreva TOGI novamente.');escapes.delete(sender);win(sender,500);return reply('🚪✨ *VOCÊ ESCAPOU!*\n🪙 +500 Tokens');
    }
    return reply('🎮 Use *.arcade* para ver todos os jogos.');
  }
};
