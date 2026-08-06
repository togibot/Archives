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
`);

export function ensureUser(jid, name = 'Usuário') {
  db.prepare(`INSERT INTO users (jid, name) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET name=excluded.name`).run(jid, name);
  return getUser(jid);
}

export function getUser(jid) {
  return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
}

export function updateUser(jid, patch) {
  const keys = Object.keys(patch);
  if (!keys.length) return getUser(jid);
  const set = keys.map(key => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE users SET ${set} WHERE jid = @jid`).run({ ...patch, jid });
  return getUser(jid);
}

export function getGroup(jid) {
  return db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid);
}

export function ensureGroup(jid, subject = '') {
  db.prepare(`INSERT INTO groups (jid, subject) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET subject=excluded.subject`).run(jid, subject);
  return getGroup(jid);
}

export function updateGroup(jid, patch) {
  const keys = Object.keys(patch);
  if (!keys.length) return getGroup(jid);
  const set = keys.map(key => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE groups SET ${set} WHERE jid = @jid`).run({ ...patch, jid });
  return getGroup(jid);
}

export function closeDatabase() {
  db.close();
}
