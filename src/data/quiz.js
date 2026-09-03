export const QUIZ_CATEGORIES = {
  geral: [
    ['Qual é o maior planeta do Sistema Solar?', ['Terra', 'Júpiter', 'Marte', 'Vênus'], 1],
    ['Qual é o maior oceano da Terra?', ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], 2],
    ['Quantos lados tem um hexágono?', ['5', '6', '7', '8'], 1]
  ],
  brasil: [
    ['Qual é a capital do Brasil?', ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Salvador'], 1],
    ['Qual é o maior estado brasileiro em território?', ['Amazonas', 'Pará', 'Mato Grosso', 'Bahia'], 0],
    ['Em qual região fica a maior parte da Floresta Amazônica brasileira?', ['Sul', 'Sudeste', 'Norte', 'Centro-Oeste'], 2]
  ],
  geografia: [
    ['Qual é o maior continente em área?', ['África', 'Ásia', 'Europa', 'Oceania'], 1],
    ['Qual país tem formato frequentemente comparado a uma bota?', ['Itália', 'Grécia', 'Portugal', 'Chile'], 0],
    ['Qual é o rio mais extenso da América do Sul?', ['Paraná', 'Amazonas', 'São Francisco', 'Orinoco'], 1]
  ],
  historia: [
    ['Em que ano começou a Revolução Francesa?', ['1789', '1804', '1815', '1776'], 0],
    ['Quem foi o primeiro imperador do Brasil?', ['Dom Pedro I', 'Dom Pedro II', 'Getúlio Vargas', 'Juscelino Kubitschek'], 0],
    ['Qual civilização construiu Machu Picchu?', ['Maia', 'Asteca', 'Inca', 'Romana'], 2]
  ],
  ciencia: [
    ['Qual planeta é conhecido como Planeta Vermelho?', ['Vênus', 'Marte', 'Júpiter', 'Mercúrio'], 1],
    ['Qual gás é mais abundante na atmosfera terrestre?', ['Oxigênio', 'Nitrogênio', 'Hélio', 'Hidrogênio'], 1],
    ['Qual órgão bombeia o sangue pelo corpo?', ['Pulmão', 'Cérebro', 'Coração', 'Fígado'], 2]
  ],
  games: [
    ['Qual empresa criou Minecraft?', ['Mojang', 'Nintendo', 'Valve', 'Epic Games'], 0],
    ['Qual é o personagem principal de The Legend of Zelda?', ['Zelda', 'Link', 'Mario', 'Kirby'], 1],
    ['Qual destes é um jogo de construção com blocos?', ['Minecraft', 'FIFA', 'Tetris Effect', 'Rocket League'], 0]
  ],
  filmes: [
    ['Qual estúdio criou Toy Story?', ['Pixar', 'DreamWorks', 'Warner Bros.', 'Sony Pictures'], 0],
    ['Qual personagem usa um escudo com uma estrela?', ['Thor', 'Hulk', 'Capitão América', 'Homem de Ferro'], 2],
    ['Qual filme apresenta o personagem Jack Sparrow?', ['Avatar', 'Piratas do Caribe', 'Jurassic Park', 'Matrix'], 1]
  ],
  esportes: [
    ['Quantos jogadores de um time de futebol ficam em campo no início de uma partida?', ['9', '10', '11', '12'], 2],
    ['Em qual esporte se usa uma raquete e uma peteca?', ['Tênis', 'Badminton', 'Beisebol', 'Vôlei'], 1],
    ['Qual país sediou os Jogos Olímpicos de 2016?', ['Brasil', 'Japão', 'China', 'Reino Unido'], 0]
  ],
  musica: [
    ['Qual instrumento possui teclas pretas e brancas?', ['Violão', 'Piano', 'Bateria', 'Flauta'], 1],
    ['Quantas cordas tem um violão tradicional?', ['4', '5', '6', '7'], 2],
    ['Qual símbolo indica uma pausa na música?', ['Pausa', 'Clave', 'Armadura', 'Acorde'], 0]
  ],
  tecnologia: [
    ['O que significa CPU?', ['Central Processing Unit', 'Computer Power User', 'Central Program Utility', 'Core Processing User'], 0],
    ['Qual linguagem é usada principalmente para estruturar páginas web?', ['HTML', 'SQL', 'Python', 'C++'], 0],
    ['Qual destes é um sistema operacional?', ['Linux', 'HTML', 'Wi-Fi', 'Bluetooth'], 0]
  ],
  matematica: [
    ['Quanto é 12 × 8?', ['86', '96', '108', '112'], 1],
    ['Qual é a raiz quadrada de 81?', ['7', '8', '9', '10'], 2],
    ['Quanto é 25% de 200?', ['25', '40', '50', '75'], 2]
  ]
};

export const FLAG_COUNTRIES = [
  ['Brasil', 'https://flagcdn.com/w640/br.png'],
  ['Argentina', 'https://flagcdn.com/w640/ar.png'],
  ['Chile', 'https://flagcdn.com/w640/cl.png'],
  ['Peru', 'https://flagcdn.com/w640/pe.png'],
  ['Colômbia', 'https://flagcdn.com/w640/co.png'],
  ['México', 'https://flagcdn.com/w640/mx.png'],
  ['Estados Unidos', 'https://flagcdn.com/w640/us.png'],
  ['Canadá', 'https://flagcdn.com/w640/ca.png'],
  ['Portugal', 'https://flagcdn.com/w640/pt.png'],
  ['Espanha', 'https://flagcdn.com/w640/es.png'],
  ['França', 'https://flagcdn.com/w640/fr.png'],
  ['Itália', 'https://flagcdn.com/w640/it.png'],
  ['Alemanha', 'https://flagcdn.com/w640/de.png'],
  ['Japão', 'https://flagcdn.com/w640/jp.png'],
  ['Coreia do Sul', 'https://flagcdn.com/w640/kr.png'],
  ['Austrália', 'https://flagcdn.com/w640/au.png'],
  ['Índia', 'https://flagcdn.com/w640/in.png'],
  ['África do Sul', 'https://flagcdn.com/w640/za.png']
];

export function normalizeCategory(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function randomQuestion(category = 'geral') {
  const key = normalizeCategory(category);
  const pool = QUIZ_CATEGORIES[key] || QUIZ_CATEGORIES.geral;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomFlag() {
  return FLAG_COUNTRIES[Math.floor(Math.random() * FLAG_COUNTRIES.length)];
}
