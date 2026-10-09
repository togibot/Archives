import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('node_modules/@whiskeysockets/baileys/lib/Socket/messages-send.js');
const MARKER = 'TOGI_STICKER_PACK_PATCH_V2';

if (!fs.existsSync(target)) {
  throw new Error(`Baileys não encontrado em: ${target}`);
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

// No 6.7.23, a mensagem principal de GRUPO é criptografada como skmsg,
// mas o atributo mediatype calculado acima não era anexado nesse nó.
// Em privado o caminho já passa extraAttrs; em grupo ele era descartado.
// O WhatsApp recebe o stanza sem erro, porém ignora StickerPackMessage.
const groupMediaRegex = /attrs:\s*\{\s*v:\s*['"]2['"]\s*,\s*type:\s*['"]skmsg['"]\s*\}/g;

if (!/attrs:\s*\{\s*v:\s*['"]2['"]\s*,\s*type:\s*['"]skmsg['"]\s*,\s*\.\.\.extraAttrs\s*\}/.test(source)) {
  let replacements = 0;
  source = source.replace(groupMediaRegex, match => {
    replacements += 1;
    return match.replace(/\}$/, ', ...extraAttrs }');
  });

  if (!replacements) {
    throw new Error('Não encontrei o nó skmsg de grupo para adicionar mediatype.');
  }

  changed = true;
}

if (!source.includes("if (message?.stickerPackMessage) return 'media';")) {
  throw new Error('Patch incompleto: getMessageType não reconhece StickerPackMessage.');
}

if (!source.includes("if (message?.stickerPackMessage) return 'sticker_pack';")) {
  throw new Error('Patch incompleto: getMediaType não reconhece StickerPackMessage.');
}

if (!/attrs:\s*\{\s*v:\s*['"]2['"]\s*,\s*type:\s*['"]skmsg['"]\s*,\s*\.\.\.extraAttrs\s*\}/.test(source)) {
  throw new Error('Patch incompleto: mensagens de grupo ainda não carregam mediatype.');
}

if (changed) {
  fs.writeFileSync(target, source);
  console.log('[TOGI] Baileys V2: StickerPack corrigido também para grupos.');
} else {
  console.log('[TOGI] Patch V2 de StickerPack já está aplicado.');
}
