import sharp from 'sharp';

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 22) {
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
  return lines.slice(0, 6);
}

export default {
  name: 'brat',
  aliases: [],
  category: 'sticker',
  description: 'Cria uma figurinha de texto com fundo branco',
  async execute({ sock, chat, args, message, reply }) {
    const text = args.join(' ').trim();
    if (!text) return reply('✍️ Informe um texto. Ex.: *.brat Togi Bot*');

    const lines = wrapText(text.slice(0, 120));
    const fontSize = lines.length >= 5 ? 38 : lines.length >= 3 ? 46 : 56;
    const startY = 256 - ((lines.length - 1) * fontSize * 0.55);
    const textSvg = lines.map((line, index) =>
      `<text x="256" y="${Math.round(startY + index * fontSize * 1.1)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#111111">${escapeXml(line)}</text>`
    ).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
      `<rect width="512" height="512" fill="#ffffff"/>` +
      `<g transform="rotate(-2 256 256)">${textSvg}</g>` +
      `</svg>`;

    const webp = await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toBuffer();

    await sock.sendMessage(chat, { sticker: webp }, { quoted: message });
  }
};
