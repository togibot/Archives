import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const databasePath = process.env.DATABASE_PATH || './data/togi.sqlite';
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS sticker_packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_jid TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(owner_jid, name)
);
CREATE TABLE IF NOT EXISTS sticker_pack_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pack_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  sticker BLOB NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(pack_id) REFERENCES sticker_packs(id) ON DELETE CASCADE,
  UNIQUE(pack_id, position)
);
`);

export function listPacks(ownerJid) {
  return db.prepare('SELECT id,name,created_at,updated_at FROM sticker_packs WHERE owner_jid = ? ORDER BY lower(name)').all(ownerJid);
}

export function getPack(ownerJid, name) {
  return db.prepare('SELECT * FROM sticker_packs WHERE owner_jid = ? AND lower(name) = lower(?)').get(ownerJid, name);
}

export function createPack(ownerJid, name) {
  const clean = String(name || '').trim();
  if (!clean) return { error: 'name' };
  if (clean.length > 40) return { error: 'length' };
  if (getPack(ownerJid, clean)) return { error: 'exists' };
  const now = Date.now();
  const result = db.prepare('INSERT INTO sticker_packs (owner_jid,name,created_at,updated_at) VALUES (?,?,?,?)').run(ownerJid, clean, now, now);
  return db.prepare('SELECT * FROM sticker_packs WHERE id = ?').get(result.lastInsertRowid);
}

export function renamePack(ownerJid, oldName, newName) {
  const pack = getPack(ownerJid, oldName);
  if (!pack) return { error: 'not_found' };
  const clean = String(newName || '').trim();
  if (!clean) return { error: 'name' };
  if (clean.length > 40) return { error: 'length' };
  const other = getPack(ownerJid, clean);
  if (other && other.id !== pack.id) return { error: 'exists' };
  db.prepare('UPDATE sticker_packs SET name = ?, updated_at = ? WHERE id = ?').run(clean, Date.now(), pack.id);
  return getPack(ownerJid, clean);
}

export function deletePack(ownerJid, name) {
  const pack = getPack(ownerJid, name);
  if (!pack) return false;
  db.prepare('DELETE FROM sticker_pack_items WHERE pack_id = ?').run(pack.id);
  db.prepare('DELETE FROM sticker_packs WHERE id = ?').run(pack.id);
  return true;
}

export function addSticker(ownerJid, name, stickerBuffer) {
  const pack = getPack(ownerJid, name);
  if (!pack) return { error: 'not_found' };
  const count = db.prepare('SELECT COUNT(*) AS count FROM sticker_pack_items WHERE pack_id = ?').get(pack.id).count;
  if (count >= 100) return { error: 'limit' };
  const position = Number(count) + 1;
  db.prepare('INSERT INTO sticker_pack_items (pack_id,position,sticker,created_at) VALUES (?,?,?,?)').run(pack.id, position, stickerBuffer, Date.now());
  db.prepare('UPDATE sticker_packs SET updated_at = ? WHERE id = ?').run(Date.now(), pack.id);
  return { position };
}

export function getStickers(ownerJid, name) {
  const pack = getPack(ownerJid, name);
  if (!pack) return null;
  return db.prepare('SELECT position,sticker FROM sticker_pack_items WHERE pack_id = ? ORDER BY position').all(pack.id);
}

export function removeSticker(ownerJid, name, position) {
  const pack = getPack(ownerJid, name);
  if (!pack) return { error: 'not_found' };
  const item = db.prepare('SELECT id FROM sticker_pack_items WHERE pack_id = ? AND position = ?').get(pack.id, position);
  if (!item) return { error: 'item' };
  db.prepare('DELETE FROM sticker_pack_items WHERE id = ?').run(item.id);
  db.prepare('UPDATE sticker_pack_items SET position = position - 1 WHERE pack_id = ? AND position > ?').run(pack.id, position);
  db.prepare('UPDATE sticker_packs SET updated_at = ? WHERE id = ?').run(Date.now(), pack.id);
  return { ok: true };
}
