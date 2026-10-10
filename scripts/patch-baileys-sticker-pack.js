import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('node_modules/@whiskeysockets/baileys/lib/Socket/messages-send.js');
const MARKER = 'TOGI_NATIVE_STICKER_PACK_V3';

if (!fs.existsSync(target)) {
  throw new Error(`Baileys 6.7.23 não encontrado em: ${target}`);
}

let source = fs.readFileSync(target, 'utf8');
let changed = false;

function injectAfter(patterns, line, label) {
  if (source.includes(line)) return;

  for (const pattern of patterns) {
    if (!pattern.test(source)) continue;
    source = source.replace(pattern, match => `${match}        // ${MARKER}\n        ${line}\n`);
    changed = true;
    return;
  }

  throw new Error(`Não encontrei ${label} no Baileys 6.7.23.`);
}

injectAfter(
  [
    /const getMessageType = \(message\) => \{\r?\n/,
    /function getMessageType\(message\) \{\r?\n/
  ],
  "if (message?.stickerPackMessage) return 'media';",
  'getMessageType'
);

injectAfter(
  [
    /const getMediaType = \(message\) => \{\r?\n/,
    /function getMediaType\(message\) \{\r?\n/
  ],
  "if (message?.stickerPackMessage) return 'sticker_pack';",
  'getMediaType'
);

// O 6.7.23 calculava extraAttrs, mas não os colocava no skmsg principal de grupos.
// StickerPackMessage precisa de mediatype=sticker_pack também nesse nó criptografado.
if (!/attrs:\s*\{\s*v:\s*['"]2['"]\s*,\s*type:\s*['"]skmsg['"]\s*,\s*\.\.\.extraAttrs\s*\}/.test(source)) {
  const pattern = /attrs:\s*\{\s*v:\s*['"]2['"]\s*,\s*type:\s*['"]skmsg['"]\s*\}/;
  if (!pattern.test(source)) {
    throw new Error('Não encontrei o nó skmsg de grupo no Baileys 6.7.23.');
  }

  source = source.replace(pattern, "attrs: { v: '2', type: 'skmsg', ...extraAttrs }");
  changed = true;
}

if (!source.includes("if (message?.stickerPackMessage) return 'media';") ||
    !source.includes("if (message?.stickerPackMessage) return 'sticker_pack';") ||
    !/attrs:\s*\{\s*v:\s*['"]2['"]\s*,\s*type:\s*['"]skmsg['"]\s*,\s*\.\.\.extraAttrs\s*\}/.test(source)) {
  throw new Error('Patch nativo de StickerPack ficou incompleto.');
}

if (changed) {
  fs.writeFileSync(target, source);
  console.log('[TOGI] Suporte de transporte StickerPack nativo aplicado ao Baileys 6.7.23.');
} else {
  console.log('[TOGI] Suporte de transporte StickerPack nativo já está aplicado.');
}
