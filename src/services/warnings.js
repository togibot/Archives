import fs from 'node:fs';
import path from 'node:path';

const filePath = process.env.WARNINGS_PATH || './data/warnings.json';
const dir = path.dirname(filePath);
fs.mkdirSync(dir, { recursive: true });

let data = {};
try {
  data = JSON.parse(fs.readFileSync(filePath, 'utf8')) || {};
} catch {
  data = {};
}

function key(chat, jid) {
  return `${chat}::${jid}`;
}

function save() {
  const temp = `${filePath}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2));
  fs.renameSync(temp, filePath);
}

export function getWarnings(chat, jid) {
  return data[key(chat, jid)] || { count: 0, entries: [] };
}

export function addWarning(chat, jid, reason = 'Sem motivo informado', by = null) {
  const current = getWarnings(chat, jid);
  const next = {
    count: current.count + 1,
    entries: [...current.entries, { reason: String(reason), by: by || null, at: Date.now() }].slice(-20)
  };
  data[key(chat, jid)] = next;
  save();
  return next;
}

export function removeWarning(chat, jid) {
  const current = getWarnings(chat, jid);
  if (current.count <= 0) return current;
  const next = { count: current.count - 1, entries: current.entries.slice(0, -1) };
  if (next.count <= 0) delete data[key(chat, jid)];
  else data[key(chat, jid)] = next;
  save();
  return next;
}

export function clearWarnings(chat, jid) {
  delete data[key(chat, jid)];
  save();
  return { count: 0, entries: [] };
}
