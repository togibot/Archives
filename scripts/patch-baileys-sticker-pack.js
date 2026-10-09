import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('node_modules/@whiskeysockets/baileys/lib/Socket/messages-send.js');
const MARKER = 'TOGI_STICKER_PACK_PATCH_V1';

if (!fs.existsSync(target)) {
  throw new Error(`Baileys não encontrado em: ${target}`);
}

let source = fs.readFileSync(target, 'utf8');

if (source.includes(MARKER)) {
  console.log('[TOGI] Patch de StickerPack já aplicado.');
  process.exit(0);
}

const messageTypePatterns = [
  /const getMessageType = \(message\) => \{\r?\n/,
  /function getMessageType\(message\) \{\r?\n/
];

const mediaTypePatterns = [
  /const getMediaType = \(message\) => \{\r?\n/,
  /function getMediaType\(message\) \{\r?\n/
];

function inject(patterns, line, label) {
  for (const pattern of patterns) {
    if (!pattern.test(source)) continue;
    source = source.replace(pattern, match => `${match}        // ${MARKER}\n        ${line}\n`);
    return;
  }
  throw new Error(`Não encontrei ${label} no Baileys 6.7.23.`);
}

// O Baileys 6.7.23 conhece o protobuf StickerPackMessage, mas não o classifica
// como mídia no relayMessage(). Sem estes dois sinais, o WhatsApp pode aceitar
// o stanza no socket e simplesmente descartar o pack sem erro.
inject(
  messageTypePatterns,
  "if (message?.stickerPackMessage) return 'media';",
  'getMessageType'
);

inject(
  mediaTypePatterns,
  "if (message?.stickerPackMessage) return 'sticker_pack';",
  'getMediaType'
);

fs.writeFileSync(target, source);
console.log('[TOGI] Baileys corrigido para rotear StickerPackMessage como sticker_pack.');
