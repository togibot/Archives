import Database from 'better-sqlite3';
import config from '../config.js';

const db = new Database(process.env.DATABASE_PATH || './data/togi.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  jid TEXT PRIMARY KEY,
  name TEXT,
  tokens INTEGER NOT NULL DEFAULT ${config.economy.startingBalance},
  last_daily INTEGER NOT NULL DEFAULT 0,
  last_weekly INTEGER NOT NULL DEFAULT 0,
  last_steal INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  afk_since INTEGER,
  afk_reason TEXT
);
CREATE TABLE IF NOT EXISTS groups (
  jid TEXT PRIMARY KEY,
  subject TEXT,
  antilink INTEGER NOT NULL DEFAULT 0,
  antiflood INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS inventory (
  jid TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (jid, item_id)
);
CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_jid TEXT NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  health INTEGER NOT NULL DEFAULT 100,
  hunger INTEGER NOT NULL DEFAULT 100,
  happiness INTEGER NOT NULL DEFAULT 100,
  created_at INTEGER NOT NULL
);
`);

export function ensureUser(jid, name = 'Usuário') {
  db.prepare(`INSERT INTO users (jid, name) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET name=excluded.name`).run(jid, name);
  return getUser(jid);
}
export function getUser(jid) { return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid); }
export function updateUser(jid, patch) {
  const allowed = new Set(['name','tokens','last_daily','last_weekly','last_steal','xp','level','afk_since','afk_reason']);
  const keys = Object.keys(patch).filter(key => allowed.has(key));
  if (!keys.length) return getUser(jid);
  const set = keys.map(key => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE users SET ${set} WHERE jid = @jid`).run({ ...patch, jid });
  return getUser(jid);
}
export function addTokens(jid, amount) {
  db.prepare('UPDATE users SET tokens = MAX(0, tokens + ?) WHERE jid = ?').run(Math.trunc(amount), jid);
  return getUser(jid);
}

export function getGroup(jid) { return db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid); }
export function ensureGroup(jid, subject = '') {
  db.prepare(`INSERT INTO groups (jid, subject) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET subject=excluded.subject`).run(jid, subject);
  return getGroup(jid);
}
export function updateGroup(jid, patch) {
  const allowed = new Set(['subject','antilink','antiflood']);
  const keys = Object.keys(patch).filter(key => allowed.has(key));
  if (!keys.length) return getGroup(jid);
  const set = keys.map(key => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE groups SET ${set} WHERE jid = @jid`).run({ ...patch, jid });
  return getGroup(jid);
}

export function getInventory(jid) { return db.prepare('SELECT * FROM inventory WHERE jid = ? AND quantity > 0').all(jid); }
export function getItemQuantity(jid, itemId) { return db.prepare('SELECT quantity FROM inventory WHERE jid = ? AND item_id = ?').get(jid, itemId)?.quantity || 0; }
export function addItem(jid, itemId, quantity) {
  db.prepare(`INSERT INTO inventory (jid, item_id, quantity) VALUES (?, ?, ?) ON CONFLICT(jid, item_id) DO UPDATE SET quantity = quantity + excluded.quantity`).run(jid, itemId, quantity);
  db.prepare('DELETE FROM inventory WHERE jid = ? AND quantity <= 0').run(jid);
  return getItemQuantity(jid, itemId);
}

export function createPet(ownerJid, name, species) {
  const result = db.prepare('INSERT INTO pets (owner_jid, name, species, created_at) VALUES (?, ?, ?, ?)').run(ownerJid, name, species, Date.now());
  return db.prepare('SELECT * FROM pets WHERE id = ?').get(result.lastInsertRowid);
}
export function getPets(ownerJid) { return db.prepare('SELECT * FROM pets WHERE owner_jid = ? ORDER BY id').all(ownerJid); }
export function getPet(ownerJid, petIdOrName) {
  const numeric = /^\d+$/.test(String(petIdOrName));
  return numeric ? db.prepare('SELECT * FROM pets WHERE owner_jid = ? AND id = ?').get(ownerJid, Number(petIdOrName)) : db.prepare('SELECT * FROM pets WHERE owner_jid = ? AND lower(name) = lower(?)').get(ownerJid, petIdOrName);
}
export function updatePet(id, patch) {
  const allowed = ['name','health','hunger','happiness','owner_jid'];
  const keys = Object.keys(patch).filter(key => allowed.includes(key));
  if (!keys.length) return db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
  const set = keys.map(key => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE pets SET ${set} WHERE id = @id`).run({ ...patch, id });
  return db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
}
export function transferPet(id, fromJid, toJid) {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND owner_jid = ?').get(id, fromJid);
  if (!pet) return null;
  db.prepare('UPDATE pets SET owner_jid = ? WHERE id = ?').run(toJid, id);
  return db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
}
export function closeDatabase() { db.close(); }
