import sharp from 'sharp';

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 14) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

export default {
  name: 'brat',
  aliases: [],
  category: 'sticker',
  description: 'Cria uma figurinha de texto com fundo branco',
  async execute({ sock, chat, args, message, reply }) {
    const text = args.join(' ').trim();
    if (!text) return reply('✍️ Informe um texto. Ex.: *.brat Togi Bot*');

    const lines = wrapText(text.slice(0, 80));
    const fontSize = lines.length >= 5 ? 58 : lines.length >= 3 ? 72 : 88;
    const lineHeight = fontSize * 1.05;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = 256 - totalHeight / 2 + fontSize * 0.34;

    const textSvg = lines.map((line, index) => {
      const y = Math.round(startY + index * lineHeight);
      return `<text x="256" y="${y}" text-anchor="middle" font-family="DejaVu Sans" font-size="${fontSize}px" font-weight="700" fill="#000000">${escapeXml(line)}</text>`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
      `<rect width="512" height="512" fill="#ffffff"/>` +
      textSvg +
      `</svg>`;

    const webp = await sharp(Buffer.from(svg, 'utf8'))
      .webp({ quality: 100 })
      .toBuffer();

    await sock.sendMessage(chat, { sticker: webp }, { quoted: message });
  }
};
