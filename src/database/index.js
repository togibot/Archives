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
export function getTopActivity(limit = 10) { return db.prepare('SELECT u.jid,u.name,g.played,g.wins,g.best_score FROM game_stats g JOIN users u ON u.jid=g.jid ORDER BY g.played DESC,g.wins DESC LIMIT ?').all(Math.max(1, Math.min(50, Number(limit) || 10))); }
export function getTopWins(limit = 10) { return db.prepare('SELECT u.jid,u.name,g.played,g.wins,g.best_score FROM game_stats g JOIN users u ON u.jid=g.jid ORDER BY g.wins DESC,g.played DESC LIMIT ?').all(Math.max(1, Math.min(50, Number(limit) || 10))); }
export function getTopStreak(limit = 10) { return db.prepare('SELECT u.jid,u.name,q.correct,q.wrong,q.streak,q.best_streak FROM quiz_stats q JOIN users u ON u.jid=q.jid ORDER BY q.best_streak DESC,q.correct DESC LIMIT ?').all(Math.max(1, Math.min(50, Number(limit) || 10))); }
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
  const numeric = /^\d+$/.test(String(petIdOrName));
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
export function recordQuiz(jid, correct) {
  const current = getQuizStats(jid);
  const streak = correct ? current.streak + 1 : 0;
  const best = Math.max(current.best_streak, streak);
  db.prepare('UPDATE quiz_stats SET correct=correct+?, wrong=wrong+?, streak=?, best_streak=? WHERE jid=?').run(correct ? 1 : 0, correct ? 0 : 1, streak, best, jid);
  return getQuizStats(jid);
}
export function getQuizRank(limit = 10) { return db.prepare(`SELECT u.jid,u.name,q.correct,q.wrong,q.best_streak,(q.correct*10-q.wrong) AS score FROM quiz_stats q JOIN users u ON u.jid=q.jid ORDER BY score DESC, q.correct DESC LIMIT ?`).all(Math.max(1, Math.min(50, Number(limit) || 10))); }

export function getHouse(groupJid) { return db.prepare('SELECT * FROM group_houses WHERE group_jid = ?').get(groupJid); }
export function createHouse(groupJid, name, createdBy) {
  db.prepare('INSERT INTO group_houses (group_jid,name,created_by,created_at) VALUES (?,?,?,?)').run(groupJid, name, createdBy, Date.now());
  return getHouse(groupJid);
}
export function renameHouse(groupJid, name) {
  db.prepare('UPDATE group_houses SET name = ? WHERE group_jid = ?').run(name, groupJid);
  return getHouse(groupJid);
}
export function contributeHouse(groupJid, userJid, points) {
  const amount = Math.max(1, Math.trunc(points));
  db.prepare('INSERT INTO house_contributions (group_jid,user_jid,points) VALUES (?,?,?) ON CONFLICT(group_jid,user_jid) DO UPDATE SET points=points+excluded.points').run(groupJid, userJid, amount);
  db.prepare('UPDATE group_houses SET points=points+?, level=1+CAST((points+?)/1000 AS INTEGER) WHERE group_jid=?').run(amount, amount, groupJid);
  return getHouse(groupJid);
}
export function getHouseContributions(groupJid, limit = 10) { return db.prepare('SELECT user_jid,points FROM house_contributions WHERE group_jid=? ORDER BY points DESC LIMIT ?').all(groupJid, Math.max(1, Math.min(20, Number(limit) || 10))); }

export function getUserCards(jid) { return db.prepare('SELECT card_id,quantity FROM user_cards WHERE jid=? AND quantity>0 ORDER BY card_id').all(jid); }
export function getCardQuantity(jid, cardId) { return db.prepare('SELECT quantity FROM user_cards WHERE jid=? AND card_id=?').get(jid, cardId)?.quantity || 0; }
export function addCard(jid, cardId, quantity = 1) {
  db.prepare('INSERT INTO user_cards (jid,card_id,quantity) VALUES (?,?,?) ON CONFLICT(jid,card_id) DO UPDATE SET quantity=quantity+excluded.quantity').run(jid, cardId, quantity);
  db.prepare('DELETE FROM user_cards WHERE jid=? AND quantity<=0').run(jid);
  return getCardQuantity(jid, cardId);
}
export function removeCard(jid, cardId, quantity = 1) { return addCard(jid, cardId, -Math.abs(quantity)); }
export function recordGame(jid, won, score = 0) {
  const current = getGameStats(jid);
  if (!current) {
    db.prepare('INSERT INTO game_stats (jid,played,wins,best_score) VALUES (?,?,?,?)').run(jid, 1, won ? 1 : 0, Math.max(0, Math.trunc(score)));
  } else {
    db.prepare('UPDATE game_stats SET played=played+1,wins=wins+?,best_score=MAX(best_score,?) WHERE jid=?').run(won ? 1 : 0, Math.max(0, Math.trunc(score)), jid);
  }
  return getGameStats(jid);
}
export function getGameStats(jid) { return db.prepare('SELECT * FROM game_stats WHERE jid=?').get(jid); }
export function closeDatabase() { db.close(); }
