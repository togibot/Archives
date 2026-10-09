import WebP from 'node-webpmux';

const DEFAULT_NAME = '💜✨ 𝐅𝐢𝐠 𝐝𝐨 𝐓𝐨𝐠𝐢 ✨💜';
const BOT_PACK_NAME = '💜 𝚃𝙾𝙶𝙸 𝙱𝙾𝚃 💜';
const OWNER = '『♛ 𝙻𝚉 ♛』';
const OWNER_NUMBER = '+5516991994982';

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function buildExif(packName, requester, groupName = 'Privado', mode = 'normal', options = {}) {
  const requestedPackName = clean(packName);
  const isTake = mode === 'take';
  const isPack = mode === 'pack';

  const normalLabel = [
    'Feito pelo Togi Bot',
    'Dono: ' + OWNER,
    'Número: ' + OWNER_NUMBER,
    '——————————————',
    'Solicitado Por: ' + clean(requester, 'Usuário'),
    'Grupo: ' + clean(groupName, 'Privado')
  ].join('\n');

  let finalName = BOT_PACK_NAME;
  let publisher = normalLabel;
  let description = normalLabel;
  let packId = 'com.togi.sticker';

  if (isTake) {
    finalName = `『${requestedPackName || 'Usuário'}』`;
    publisher = finalName;
    description = finalName;
    packId = 'com.togi.take';
  } else if (isPack) {
    finalName = requestedPackName || DEFAULT_NAME;
    publisher = clean(options.publisher, 'Togi Bot');
    description = clean(options.description, `Pack criado no Togi Bot por ${clean(requester, 'Usuário')}`);
    packId = clean(options.packId, 'com.togi.pack');
  } else if (requestedPackName) {
    finalName = requestedPackName;
  }

  const payload = JSON.stringify({
    'sticker-pack-id': packId,
    'sticker-pack-name': finalName,
    'sticker-pack-publisher': publisher,
    'sticker-pack-description': description,
    'togi-exif-version': '4.0',
    emojis: Array.isArray(options.emojis) && options.emojis.length ? options.emojis.slice(0, 5) : ['💜', '✨']
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
    packName || '',
    requester || 'Usuário',
    groupName || 'Privado',
    options.mode || 'normal',
    options
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
