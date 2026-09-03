import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import config from '../config.js';

const databasePath = process.env.DATABASE_PATH || './data/togi.sqlite';
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
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
  afk_reason TEXT,
  job TEXT,
  pet_shop_level INTEGER NOT NULL DEFAULT 1,
  sticker_nick TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS groups (
  jid TEXT PRIMARY KEY,
  subject TEXT,
  antilink INTEGER NOT NULL DEFAULT 0,
  antiflood INTEGER NOT NULL DEFAULT 0,
  anti_profanity INTEGER NOT NULL DEFAULT 0,
  profanity_words TEXT NOT NULL DEFAULT '[]'
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
  thirst INTEGER NOT NULL DEFAULT 100,
  happiness INTEGER NOT NULL DEFAULT 100,
  last_needs_update INTEGER NOT NULL DEFAULT 0,
  walk_count INTEGER NOT NULL DEFAULT 0,
  walk_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'vivo',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS quiz_stats (
  jid TEXT PRIMARY KEY,
  correct INTEGER NOT NULL DEFAULT 0,
  wrong INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS rp_relationships (
  user_a TEXT PRIMARY KEY,
  user_b TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS rp_family (
  user_jid TEXT NOT NULL,
  relation TEXT NOT NULL,
  target_jid TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_jid, relation, target_jid)
);
CREATE TABLE IF NOT EXISTS group_houses (
  group_jid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS house_contributions (
  group_jid TEXT NOT NULL,
  user_jid TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (group_jid, user_jid)
);
CREATE TABLE IF NOT EXISTS user_cards (
  jid TEXT NOT NULL,
  card_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (jid, card_id)
);
CREATE TABLE IF NOT EXISTS game_stats (
  jid TEXT PRIMARY KEY,
  played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0
);
`);

for (const sql of [
  'ALTER TABLE users ADD COLUMN job TEXT',
  'ALTER TABLE users ADD COLUMN pet_shop_level INTEGER NOT NULL DEFAULT 1',
  "ALTER TABLE users ADD COLUMN sticker_nick TEXT NOT NULL DEFAULT ''",
  'ALTER TABLE groups ADD COLUMN anti_profanity INTEGER NOT NULL DEFAULT 0',
  "ALTER TABLE groups ADD COLUMN profanity_words TEXT NOT NULL DEFAULT '[]'",
  'ALTER TABLE pets ADD COLUMN thirst INTEGER NOT NULL DEFAULT 100',
  'ALTER TABLE pets ADD COLUMN last_needs_update INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE pets ADD COLUMN walk_count INTEGER NOT NULL DEFAULT 0',
  "ALTER TABLE pets ADD COLUMN walk_date TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE pets ADD COLUMN status TEXT NOT NULL DEFAULT 'vivo'"
]) {
  try { db.exec(sql); } catch (error) {
    if (!String(error?.message || '').includes('duplicate column name')) throw error;
  }
}

export function ensureUser(jid, name = 'Usuário') {
  db.prepare(`INSERT INTO users (jid, name) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET name=excluded.name`).run(jid, name);
  return getUser(jid);
}
export function getUser(jid) { return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid); }
export function getTopUsers(limit = 10) { return db.prepare('SELECT jid,name,tokens,xp,level FROM users ORDER BY tokens DESC LIMIT ?').all(Math.max(1, Math.min(50, Number(limit) || 10))); }
export function getTopXP(limit = 10) { return db.prepare('SELECT jid,name,tokens,xp,level FROM users ORDER BY xp DESC LIMIT ?').all(Math.max(1, Math.min(50, Number(limit) || 10))); }
export function updateUser(jid, patch) {
  const allowed = new Set(['name','tokens','last_daily','last_weekly','last_steal','xp','level','afk_since','afk_reason','job','pet_shop_level','sticker_nick']);
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
export function spendTokens(jid, amount) {
  const cost = Math.max(0, Math.trunc(amount));
  const result = db.prepare('UPDATE users SET tokens = tokens - ? WHERE jid = ? AND tokens >= ?').run(cost, jid, cost);
  return result.changes > 0;
}

export function getGroup(jid) { return db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid); }
export function ensureGroup(jid, subject = '') {
  db.prepare(`INSERT INTO groups (jid, subject) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET subject=excluded.subject`).run(jid, subject);
  return getGroup(jid);
}
export function updateGroup(jid, patch) {
  const allowed = new Set(['subject','antilink','antiflood','anti_profanity','profanity_words']);
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
  const now = Date.now();
  const result = db.prepare("INSERT INTO pets (owner_jid, name, species, health, hunger, thirst, happiness, last_needs_update, walk_count, walk_date, status, created_at) VALUES (?, ?, ?, 100, 100, 100, 100, ?, 0, ?, 'vivo', ?)").run(ownerJid, name, species, now, '', now);
  return db.prepare('SELECT * FROM pets WHERE id = ?').get(result.lastInsertRowid);
}
export function getPets(ownerJid) { return db.prepare('SELECT * FROM pets WHERE owner_jid = ? ORDER BY id').all(ownerJid); }
export function getPet(ownerJid, petIdOrName) {
  const numeric = /^\\d+$/.test(String(petIdOrName));
  return numeric ? db.prepare('SELECT * FROM pets WHERE owner_jid = ? AND id = ?').get(ownerJid, Number(petIdOrName)) : db.prepare('SELECT * FROM pets WHERE owner_jid = ? AND lower(name) = lower(?)').get(ownerJid, petIdOrName);
}
export function getAllLivingPets() { return db.prepare("SELECT * FROM pets WHERE status = 'vivo'").all(); }
export function getTopPets(limit = 10) { return db.prepare("SELECT owner_jid,name,species,health,hunger,thirst,happiness FROM pets WHERE status = 'vivo' ORDER BY happiness DESC, health DESC LIMIT ?").all(Math.max(1, Math.min(50, Number(limit) || 10))); }
export function updatePet(id, patch) {
  const allowed = ['name','health','hunger','thirst','happiness','owner_jid','last_needs_update','walk_count','walk_date','status'];
  const keys = Object.keys(patch).filter(key => allowed.includes(key));
  if (!keys.length) return db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
  const set = keys.map(key => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE pets SET ${set} WHERE id = @id`).run({ ...patch, id });
  return db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
}
export function transferPet(id, fromJid, toJid) {
  const pet = db.prepare("SELECT * FROM pets WHERE id = ? AND owner_jid = ? AND status = 'vivo'").get(id, fromJid);
  if (!pet) return null;
  db.prepare('UPDATE pets SET owner_jid = ? WHERE id = ?').run(toJid, id);
  return db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
}

function relationshipKey(a, b) {
  return [String(a), String(b)].sort();
}
export function getRelationship(jid) {
  return db.prepare('SELECT * FROM rp_relationships WHERE user_a = ? OR user_b = ?').get(jid, jid) || null;
}
export function setRelationship(a, b) {
  const [userA, userB] = relationshipKey(a, b);
  db.prepare('INSERT OR REPLACE INTO rp_relationships (user_a,user_b,created_at) VALUES (?,?,?)').run(userA, userB, Date.now());
  return getRelationship(a);
}
export function removeRelationship(jid) {
  db.prepare('DELETE FROM rp_relationships WHERE user_a = ? OR user_b = ?').run(jid, jid);
}
export function setFamilyRelation(userJid, relation, targetJid) {
  const singleRelations = new Set(['pai', 'mae']);
  if (singleRelations.has(relation)) db.prepare('DELETE FROM rp_family WHERE user_jid = ? AND relation = ?').run(userJid, relation);
  db.prepare('INSERT OR IGNORE INTO rp_family (user_jid, relation, target_jid, created_at) VALUES (?,?,?,?)').run(userJid, relation, targetJid, Date.now());
  return getFamily(userJid);
}
export function getFamily(jid) {
  return db.prepare('SELECT * FROM rp_family WHERE user_jid = ? ORDER BY relation, created_at').all(jid);
}

export function getQuizStats(jid) {
  db.prepare('INSERT INTO quiz_stats (jid) VALUES (?) ON CONFLICT(jid) DO NOTHING').run(jid);
  return db.prepare('SELECT * FROM quiz_stats WHERE jid = ?').get(jid);
}
