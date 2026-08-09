import sharp from 'sharp';

const WIDTH = 1080;
const HEIGHT = 1080;
const MAX_CHARS = 180;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 18) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 8);
}

function buildSvg(text) {
  const lines = wrapText(text);
  const fontSize = lines.length >= 6 ? 92 : lines.length >= 4 ? 112 : 132;
  const lineHeight = Math.round(fontSize * 1.03);
  const totalHeight = (lines.length - 1) * lineHeight;
  const startY = HEIGHT / 2 - totalHeight / 2 + fontSize * 0.34;
  const tspans = lines.map((line, index) =>
    `<tspan x="540" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
  ).join('');

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#8be35b"/>
    <text x="540" y="${startY}" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}px" font-weight="900"
      fill="#111111" stroke="#111111" stroke-width="2" paint-order="stroke" letter-spacing="-2px">${tspans}</text>
  </svg>`;
}

export default {
  name: 'brat',
  aliases: ['brattext'],
  category: 'figurinhas',
  description: 'Cria uma imagem de texto no estilo Brat.',
  async execute({ args, reply, sock, chat }) {
    const text = args.join(' ').trim();
    if (!text) return reply('💚 Use *.brat seu texto aqui*');
    if (text.length > MAX_CHARS) return reply(`💚 Seu texto é muito grande. Use no máximo ${MAX_CHARS} caracteres.`);

    try {
      const buffer = await sharp(Buffer.from(buildSvg(text))).png().toBuffer();
      await sock.sendMessage(chat, {
        image: buffer,
        caption: '💚 𝐁𝐑𝐀𝐓'
      });
    } catch (error) {
      throw new Error(`Não consegui gerar a imagem Brat: ${error?.message || 'erro desconhecido'}`);
    }
  }
};
