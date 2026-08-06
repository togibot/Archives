const questions = [
  { q: 'Qual é a capital do Brasil?', a: ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Salvador'], correct: 2, difficulty: 'facil', category: 'geografia' },
  { q: 'Qual planeta é conhecido como Planeta Vermelho?', a: ['Vênus', 'Júpiter', 'Marte', 'Mercúrio'], correct: 3, difficulty: 'facil', category: 'ciência' },
  { q: 'Qual é o maior oceano da Terra?', a: ['Atlântico', 'Índico', 'Ártico', 'Pacífico'], correct: 4, difficulty: 'facil', category: 'geografia' },
  { q: 'Qual elemento químico tem o símbolo O?', a: ['Ouro', 'Oxigênio', 'Ósmio', 'Prata'], correct: 2, difficulty: 'facil', category: 'ciência' },
  { q: 'Quem escreveu Dom Casmurro?', a: ['José de Alencar', 'Machado de Assis', 'Carlos Drummond de Andrade', 'Monteiro Lobato'], correct: 2, difficulty: 'medio', category: 'literatura' },
  { q: 'Qual é o resultado de 17²?', a: ['279', '289', '297', '307'], correct: 2, difficulty: 'medio', category: 'matemática' },
  { q: 'Qual é a fórmula química da água?', a: ['CO₂', 'H₂O', 'O₂', 'NaCl'], correct: 2, difficulty: 'facil', category: 'ciência' },
  { q: 'Em que continente fica o Egito?', a: ['Ásia', 'Europa', 'África', 'Oceania'], correct: 3, difficulty: 'facil', category: 'geografia' },
  { q: 'Qual é a raiz quadrada de 144?', a: ['10', '11', '12', '14'], correct: 3, difficulty: 'facil', category: 'matemática' },
  { q: 'Qual linguagem é usada principalmente para estilizar páginas web?', a: ['CSS', 'SQL', 'Python', 'C++'], correct: 1, difficulty: 'facil', category: 'tecnologia' },
  { q: 'Qual é o maior planeta do Sistema Solar?', a: ['Terra', 'Saturno', 'Júpiter', 'Netuno'], correct: 3, difficulty: 'facil', category: 'ciência' },
  { q: 'Qual é o número primo entre estas opções?', a: ['21', '27', '29', '33'], correct: 3, difficulty: 'medio', category: 'matemática' },
  { q: 'Qual país tem Lisboa como capital?', a: ['Espanha', 'Portugal', 'Itália', 'Grécia'], correct: 2, difficulty: 'facil', category: 'geografia' },
  { q: 'Qual é o gás mais abundante na atmosfera terrestre?', a: ['Oxigênio', 'Nitrogênio', 'Hélio', 'Dióxido de carbono'], correct: 2, difficulty: 'medio', category: 'ciência' },
  { q: 'Qual civilização construiu Machu Picchu?', a: ['Maia', 'Asteca', 'Inca', 'Romana'], correct: 3, difficulty: 'medio', category: 'história' },
  { q: 'Qual é o menor número primo?', a: ['0', '1', '2', '3'], correct: 3, difficulty: 'facil', category: 'matemática' },
  { q: 'Qual protocolo é usado para páginas web seguras?', a: ['FTP', 'HTTP', 'HTTPS', 'SMTP'], correct: 3, difficulty: 'medio', category: 'tecnologia' },
  { q: 'Qual é a unidade básica da vida?', a: ['Átomo', 'Célula', 'Tecido', 'Órgão'], correct: 2, difficulty: 'facil', category: 'biologia' },
  { q: 'Qual é o maior órgão do corpo humano?', a: ['Fígado', 'Cérebro', 'Pele', 'Pulmão'], correct: 3, difficulty: 'medio', category: 'biologia' },
  { q: 'Qual planeta possui os anéis mais famosos do Sistema Solar?', a: ['Marte', 'Saturno', 'Mercúrio', 'Vênus'], correct: 2, difficulty: 'facil', category: 'ciência' },
];

function addMath(q, correct, wrongs, difficulty) {
  questions.push({ q, a: [String(correct), ...wrongs.map(String)], correct: 1, difficulty, category: 'matemática' });
}

for (let a = 2; a <= 40; a++) {
  for (let b = 2; b <= 40; b++) {
    const c = a * b;
    addMath(`Quanto é ${a} × ${b}?`, c, [c - a, c + b, c + a], a >= 15 || b >= 15 ? 'medio' : 'facil');
  }
}

for (let a = 10; a <= 70; a += 2) {
  for (let b = 10; b <= 70; b += 2) {
    const sum = a + b;
    addMath(`Quanto é ${a} + ${b}?`, sum, [sum + 2, sum - 2, sum + 10], a + b >= 80 ? 'medio' : 'facil');
    const diff = Math.abs(a - b);
    addMath(`Quanto é ${Math.max(a, b)} − ${Math.min(a, b)}?`, diff, [diff + 2, diff + 5, Math.max(0, diff - 2)], 'facil');
  }
}

for (let divisor = 2; divisor <= 30; divisor++) {
  for (let result = 2; result <= 30; result++) {
    const dividend = divisor * result;
    addMath(`Quanto é ${dividend} ÷ ${divisor}?`, result, [result + 1, Math.max(1, result - 1), result + 3], divisor >= 15 || result >= 15 ? 'medio' : 'facil');
  }
}

for (let n = 5; n <= 70; n++) {
  const sq = n * n;
  addMath(`Qual é o quadrado de ${n}?`, sq, [sq + n, sq - n, sq + 10], n >= 30 ? 'dificil' : 'medio');
}

for (let base = 100; base <= 1000; base += 50) {
  for (const pct of [5, 10, 15, 20, 25, 30, 40, 50]) {
    const value = base * pct / 100;
    addMath(`Quanto é ${pct}% de ${base}?`, value, [value + 5, value - 5, value + 10], pct >= 25 && base >= 500 ? 'medio' : 'facil');
  }
}

for (let start = 2; start <= 100; start += 2) {
  const step = (start % 7) + 2;
  const next = start + step * 4;
  questions.push({
    q: `Complete a sequência: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ?`,
    a: [String(next), String(next + step), String(next - step), String(next + 2)],
    correct: 1,
    difficulty: step >= 6 ? 'medio' : 'facil',
    category: 'lógica'
  });
}

for (let a = 2; a <= 20; a++) {
  for (let b = 2; b <= 5; b++) {
    const value = a ** b;
    addMath(`Quanto é ${a} elevado a ${b}?`, value, [value + a, value - a, value + b], 'dificil');
  }
}

for (let n = 11; n <= 99; n++) {
  const mod = n % 7;
  addMath(`Qual é o resto de ${n} ÷ 7?`, mod, [(mod + 1) % 7, (mod + 2) % 7, (mod + 3) % 7], 'dificil');
}

questions.push(
  { q: 'Qual é o número atômico do carbono?', a: ['4', '6', '8', '12'], correct: 2, difficulty: 'dificil', category: 'ciência' },
  { q: 'Qual é a capital da Mongólia?', a: ['Astana', 'Ulan Bator', 'Tashkent', 'Baku'], correct: 2, difficulty: 'dificil', category: 'geografia' },
  { q: 'Qual tratado é associado ao fim da Primeira Guerra Mundial?', a: ['Tratado de Roma', 'Tratado de Versalhes', 'Tratado de Tordesilhas', 'Tratado de Maastricht'], correct: 2, difficulty: 'dificil', category: 'história' },
  { q: 'Qual estrutura de dados segue o princípio LIFO?', a: ['Fila', 'Pilha', 'Árvore', 'Grafo'], correct: 2, difficulty: 'dificil', category: 'tecnologia' },
  { q: 'Qual planeta tem o período de rotação mais longo entre os oito planetas?', a: ['Mercúrio', 'Vênus', 'Marte', 'Netuno'], correct: 2, difficulty: 'dificil', category: 'ciência' },
  { q: 'Qual é aproximadamente o valor de √2?', a: ['1,14', '1,41', '1,62', '2,14'], correct: 2, difficulty: 'dificil', category: 'matemática' }
);

export const quizQuestions = questions;
