import fs from 'node:fs';
import path from 'node:path';
import { getWarningConfig } from '../database/index.js';

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

function activeEntries(chat, jid) {
  const current = data[key(chat, jid)] || { count: 0, entries: [] };
  const timeoutMs = getWarningConfig(chat).timeoutMs;

  if (!timeoutMs || !Array.isArray(current.entries)) {
    return current.entries || [];
  }

  const cutoff = Date.now() - timeoutMs;
  return current.entries.filter(entry => Number(entry?.at || 0) >= cutoff);
}

function normalize(chat, jid) {
  const entries = activeEntries(chat, jid);
  const currentKey = key(chat, jid);
  if (!entries.length) {
    if (data[currentKey]) {
      delete data[currentKey];
      save();
    }
    return { count: 0, entries: [] };
  }

  const current = data[currentKey] || {};
  if (entries.length !== Number(current.count || 0) || entries.length !== (current.entries || []).length) {
    data[currentKey] = { count: entries.length, entries };
    save();
  }

  return { count: entries.length, entries };
}

export function getWarnings(chat, jid) {
  return normalize(chat, jid);
}

export function addWarning(chat, jid, reason = 'Sem motivo informado', by = null) {
  const current = normalize(chat, jid);
  const next = {
    count: current.count + 1,
    entries: [...current.entries, { reason: String(reason), by: by || null, at: Date.now() }].slice(-20)
  };
  data[key(chat, jid)] = next;
  save();
  return next;
}

export function removeWarning(chat, jid) {
  const current = normalize(chat, jid);
  if (current.count <= 0) return current;

  const next = {
    count: Math.max(0, current.count - 1),
    entries: current.entries.slice(0, -1)
  };

  if (!next.count) delete data[key(chat, jid)];
  else data[key(chat, jid)] = next;
  save();
  return next;
}

export function clearWarnings(chat, jid) {
  delete data[key(chat, jid)];
  save();
  return { count: 0, entries: [] };
}
