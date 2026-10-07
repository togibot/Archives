import WebP from 'node-webpmux';

const DEFAULT_NAME = '💜✨ 𝐅𝐢𝐠 𝐝𝐨 𝐓𝐨𝐠𝐢 ✨💜';
const OWNER = '『♛ 𝙻𝚉 ♛』';
const OWNER_NUMBER = '+5516991994982';

function buildExif(packName, requester, groupName = 'Privado', mode = 'normal') {
  const isTake = mode === 'take';
  const normalLabel = [
    'Feito pelo Togi Bot',
    'Dono: ' + OWNER,
    'Número: ' + OWNER_NUMBER,
    '——————————————',
    'Solicitado Por: ' + (requester || 'Usuário'),
    'Grupo: ' + (groupName || 'Privado')
  ].join('\n');

  const payload = JSON.stringify({
    'sticker-pack-id': 'com.togi.sticker',
    'sticker-pack-name': isTake ? String(packName || '').trim() || DEFAULT_NAME : '💜 𝚃𝙾𝙶𝙸 𝙱𝙾𝚃 💜',
    'sticker-pack-publisher': isTake ? String(packName || '').trim() || DEFAULT_NAME : normalLabel,
    'sticker-pack-description': isTake ? '『 ' + String(packName || '').trim() + ' 』' : normalLabel,
    'togi-exif-version': '3.0',
    emojis: ['💜', '✨']
  });

  const json = Buffer.from(payload, 'utf8');

  const header = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57, 0x07, 0x00,
    0x00, 0x00, 0x00,
    0x00, 0x16, 0x00, 0x00, 0x00
  ]);

  const exif = Buffer.concat([header, json]);
  exif.writeUIntLE(json.length, 14, 4);
  return exif;
}

export async function applyStickerMetadata(webpBuffer, packName, requester, groupName, options = {}) {
  const image = new WebP.Image();
  await image.load(webpBuffer);
  image.exif = buildExif(
    packName || DEFAULT_NAME,
    requester || 'Usuário',
    groupName || 'Privado',
    options.mode || 'normal'
  );
  return image.save(null);
}

export function getDefaultStickerName() {
  return DEFAULT_NAME;
}

export function getOwnerExif() {
  return {
    owner: OWNER,
    number: OWNER_NUMBER
  };
}
