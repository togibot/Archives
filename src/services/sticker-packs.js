import Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const databasePath = process.env.DATABASE_PATH || './data/togi.sqlite';
const MAX_PACK_STICKERS = 100;
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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

function hasColumn(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some(item => item.name === column);
}

function addColumn(table, definition) {
  const name = definition.trim().split(/\s+/)[0];
  if (!hasColumn(table, name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}

addColumn('sticker_packs', "publisher TEXT NOT NULL DEFAULT 'Togi Bot'");
addColumn('sticker_packs', "description TEXT NOT NULL DEFAULT ''");
addColumn('sticker_packs', 'cover BLOB');
addColumn('sticker_packs', 'is_active INTEGER NOT NULL DEFAULT 0');
addColumn('sticker_pack_items', "sha256 TEXT NOT NULL DEFAULT ''");

db.exec(`
CREATE INDEX IF NOT EXISTS idx_sticker_packs_owner_active
  ON sticker_packs(owner_jid, is_active);
CREATE INDEX IF NOT EXISTS idx_sticker_pack_items_pack_hash
  ON sticker_pack_items(pack_id, sha256);
`);

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function withCount(pack) {
  if (!pack) return null;
  const count = db.prepare('SELECT COUNT(*) AS count FROM sticker_pack_items WHERE pack_id = ?').get(pack.id)?.count || 0;
  return { ...pack, count: Number(count) };
}

function activate(ownerJid, packId) {
  const tx = db.transaction(() => {
    db.prepare('UPDATE sticker_packs SET is_active = 0 WHERE owner_jid = ?').run(ownerJid);
    db.prepare('UPDATE sticker_packs SET is_active = 1, updated_at = ? WHERE id = ? AND owner_jid = ?')
      .run(Date.now(), packId, ownerJid);
  });
  tx();
}

export function listPacks(ownerJid) {
  return db.prepare(`
    SELECT p.id, p.name, p.publisher, p.description, p.is_active, p.created_at, p.updated_at,
           COUNT(i.id) AS count
    FROM sticker_packs p
    LEFT JOIN sticker_pack_items i ON i.pack_id = p.id
    WHERE p.owner_jid = ?
    GROUP BY p.id
    ORDER BY p.is_active DESC, lower(p.name)
  `).all(ownerJid).map(item => ({ ...item, count: Number(item.count || 0) }));
}

export function getPack(ownerJid, name) {
  const cleanName = clean(name);
  if (!cleanName) return null;
  return withCount(
    db.prepare('SELECT * FROM sticker_packs WHERE owner_jid = ? AND lower(name) = lower(?)').get(ownerJid, cleanName)
  );
}

export function getActivePack(ownerJid) {
  const active = db.prepare('SELECT * FROM sticker_packs WHERE owner_jid = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1').get(ownerJid);
  if (active) return withCount(active);

  const latest = db.prepare('SELECT * FROM sticker_packs WHERE owner_jid = ? ORDER BY updated_at DESC LIMIT 1').get(ownerJid);
  if (!latest) return null;
  activate(ownerJid, latest.id);
  return withCount({ ...latest, is_active: 1 });
}

export function resolvePack(ownerJid, name = '') {
  return clean(name) ? getPack(ownerJid, name) : getActivePack(ownerJid);
}

export function setActivePack(ownerJid, name) {
  const pack = getPack(ownerJid, name);
  if (!pack) return { error: 'not_found' };
  activate(ownerJid, pack.id);
  return getPack(ownerJid, pack.name);
}

export function createPack(ownerJid, name, options = {}) {
  const packName = clean(name);
  if (!packName) return { error: 'name' };
  if (packName.length > 40) return { error: 'length' };
  if (getPack(ownerJid, packName)) return { error: 'exists' };

  const publisher = clean(options.publisher) || 'Togi Bot';
  const description = clean(options.description);
  const now = Date.now();

  const tx = db.transaction(() => {
    db.prepare('UPDATE sticker_packs SET is_active = 0 WHERE owner_jid = ?').run(ownerJid);
    const result = db.prepare(`
      INSERT INTO sticker_packs (owner_jid, name, publisher, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(ownerJid, packName, publisher, description, now, now);
    return Number(result.lastInsertRowid);
  });

  const id = tx();
  return withCount(db.prepare('SELECT * FROM sticker_packs WHERE id = ?').get(id));
}

export function updatePackMeta(ownerJid, name, fields = {}) {
  const pack = resolvePack(ownerJid, name);
  if (!pack) return { error: 'not_found' };

  const updates = [];
  const values = [];
  if (Object.hasOwn(fields, 'publisher')) {
    const publisher = clean(fields.publisher);
    if (!publisher) return { error: 'publisher' };
    if (publisher.length > 50) return { error: 'publisher_length' };
    updates.push('publisher = ?');
    values.push(publisher);
  }
  if (Object.hasOwn(fields, 'description')) {
    const description = clean(fields.description);
    if (description.length > 120) return { error: 'description_length' };
    updates.push('description = ?');
    values.push(description);
  }

  if (!updates.length) return pack;
  updates.push('updated_at = ?');
  values.push(Date.now(), pack.id);
  db.prepare(`UPDATE sticker_packs SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return getPack(ownerJid, pack.name);
}

export function setPackCover(ownerJid, name, coverBuffer) {
  const pack = resolvePack(ownerJid, name);
  if (!pack) return { error: 'not_found' };
  if (!Buffer.isBuffer(coverBuffer) || !coverBuffer.length) return { error: 'cover' };
  db.prepare('UPDATE sticker_packs SET cover = ?, updated_at = ? WHERE id = ?')
    .run(coverBuffer, Date.now(), pack.id);
  return getPack(ownerJid, pack.name);
}

export function renamePack(ownerJid, oldName, newName) {
  const pack = resolvePack(ownerJid, oldName);
  if (!pack) return { error: 'not_found' };
  const newPackName = clean(newName);
  if (!newPackName) return { error: 'name' };
  if (newPackName.length > 40) return { error: 'length' };
  const other = getPack(ownerJid, newPackName);
  if (other && other.id !== pack.id) return { error: 'exists' };
  db.prepare('UPDATE sticker_packs SET name = ?, updated_at = ? WHERE id = ?').run(newPackName, Date.now(), pack.id);
  return getPack(ownerJid, newPackName);
}

export function deletePack(ownerJid, name) {
  const pack = resolvePack(ownerJid, name);
  if (!pack) return false;
  const wasActive = Boolean(pack.is_active);

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM sticker_pack_items WHERE pack_id = ?').run(pack.id);
    db.prepare('DELETE FROM sticker_packs WHERE id = ?').run(pack.id);
    if (wasActive) {
      const next = db.prepare('SELECT id FROM sticker_packs WHERE owner_jid = ? ORDER BY updated_at DESC LIMIT 1').get(ownerJid);
      if (next) db.prepare('UPDATE sticker_packs SET is_active = 1 WHERE id = ?').run(next.id);
    }
  });
  tx();
  return true;
}

export function addSticker(ownerJid, name, stickerBuffer) {
  const pack = resolvePack(ownerJid, name);
  if (!pack) return { error: 'not_found' };
  if (!Buffer.isBuffer(stickerBuffer) || !stickerBuffer.length) return { error: 'media' };

  const count = Number(db.prepare('SELECT COUNT(*) AS count FROM sticker_pack_items WHERE pack_id = ?').get(pack.id)?.count || 0);
  if (count >= MAX_PACK_STICKERS) return { error: 'limit' };

  const hash = digest(stickerBuffer);
  const duplicate = db.prepare(`
    SELECT position FROM sticker_pack_items
    WHERE pack_id = ? AND (sha256 = ? OR (sha256 = '' AND hex(sticker) = hex(?)))
    LIMIT 1
  `).get(pack.id, hash, stickerBuffer);
  if (duplicate) return { error: 'duplicate', position: duplicate.position };

  const position = count + 1;
  db.prepare(`
    INSERT INTO sticker_pack_items (pack_id, position, sticker, sha256, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(pack.id, position, stickerBuffer, hash, Date.now());
  db.prepare('UPDATE sticker_packs SET updated_at = ? WHERE id = ?').run(Date.now(), pack.id);
  return { position, pack: getPack(ownerJid, pack.name) };
}

export function getStickers(ownerJid, name = '') {
  const pack = resolvePack(ownerJid, name);
  if (!pack) return null;
  return db.prepare('SELECT position, sticker, sha256 FROM sticker_pack_items WHERE pack_id = ? ORDER BY position').all(pack.id);
}

export function removeSticker(ownerJid, name, position) {
  const pack = resolvePack(ownerJid, name);
  if (!pack) return { error: 'not_found' };
  const item = db.prepare('SELECT id FROM sticker_pack_items WHERE pack_id = ? AND position = ?').get(pack.id, position);
  if (!item) return { error: 'item' };

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM sticker_pack_items WHERE id = ?').run(item.id);
    db.prepare('UPDATE sticker_pack_items SET position = position - 1 WHERE pack_id = ? AND position > ?').run(pack.id, position);
    db.prepare('UPDATE sticker_packs SET updated_at = ? WHERE id = ?').run(Date.now(), pack.id);
  });
  tx();
  return { ok: true, pack: getPack(ownerJid, pack.name) };
}

export function getStickerPackLimit() {
  return MAX_PACK_STICKERS;
}
