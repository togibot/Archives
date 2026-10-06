const SOURCES = [
  'https://www.pexels.com/search/{query}/',
  'https://unsplash.com/s/photos/{query}'
];

function normalize(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
}

const STYLE_QUERIES = {
  mm: ['two boys matching pfp', 'male friends matching profile pictures'],
  ff: ['two girls matching pfp', 'female friends matching profile pictures'],
  mf: ['boy girl matching pfp', 'boy and girl matching profile pictures']
};

export function buildMetadinhaQueries(theme = 'anime', type = 'random') {
  const cleanTheme = normalize(theme) || 'anime';
  const queries = STYLE_QUERIES[type] || [
    'matching profile pictures'
  ];

  return queries.map(q => `${cleanTheme} ${q}`);
}

export function getMetadinhaOptions() {
  return [
    { key: 'mm', label: '👦 + 👦 Menino + Menino' },
    { key: 'ff', label: '👧 + 👧 Menina + Menina' },
    { key: 'mf', label: '👦 + 👧 Menino + Menina' },
    { key: 'random', label: '🎲 Aleatório' }
  ];
}

// A busca externa fica isolada aqui para podermos trocar a fonte sem alterar o comando.
export function getPublicSearchSources() {
  return SOURCES;
}
