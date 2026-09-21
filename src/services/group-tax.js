import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const databasePath = process.env.DATABASE_PATH || './data/togi.sqlite';
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS groups (
  jid TEXT PRIMARY KEY,
  subject TEXT,
  antilink INTEGER NOT NULL DEFAULT 0,
  antiflood INTEGER NOT NULL DEFAULT 0,
  anti_profanity INTEGER NOT NULL DEFAULT 0,
  profanity_words TEXT NOT NULL DEFAULT '[]',
  tax_percent INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS owner_fund (
  id INTEGER PRIMARY KEY CHECK (id=1),
  tokens INTEGER NOT NULL DEFAULT 0
);
`);

try { db.exec("ALTER TABLE groups ADD COLUMN tax_percent INTEGER NOT NULL DEFAULT 0"); } catch (error) {
  if (!String(error?.message || '').includes('duplicate column name')) throw error;
}

const MAX_TAX = 10;

function normalizeJid(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const [local, server = 's.whatsapp.net'] = raw.split('@');
  const cleanLocal = local.split(':')[0];
  return `${cleanLocal}@${server}`;
}

function addTokens(jid, amount) {
  db.prepare('UPDATE users SET tokens=MAX(0,tokens+?) WHERE jid=?').run(Math.trunc(amount), jid);
}

function ensureUser(jid, name = 'Usuário') {
  db.prepare('INSERT INTO users (jid,name) VALUES (?,?) ON CONFLICT(jid) DO UPDATE SET name=excluded.name').run(jid, name);
}

export function getGroupTax(groupJid) {
  return Number(db.prepare('SELECT tax_percent FROM groups WHERE jid=?').get(groupJid)?.tax_percent || 0);
}

export function setGroupTax(groupJid, percent, subject = '') {
  const value = Math.max(0, Math.min(MAX_TAX, Math.trunc(Number(percent))));
  db.prepare('INSERT INTO groups (jid,subject,tax_percent) VALUES (?,?,?) ON CONFLICT(jid) DO UPDATE SET subject=excluded.subject,tax_percent=excluded.tax_percent').run(groupJid, subject, value);
  return value;
}

export function isGroupAdmin(metadata, jid) {
  const normalized = normalizeJid(jid);
  return Boolean(metadata?.participants?.some(p => {
    const candidates = [p?.phoneNumber, p?.jid, p?.id, p?.lid, p?.participant];
    return (p.admin === 'admin' || p.admin === 'superadmin') && candidates.some(value => normalizeJid(value) === normalized);
  }));
}

export function getGroupAdminJids(metadata) {
  return [...new Set((metadata?.participants || [])
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => normalizeJid(p.phoneNumber || p.jid || p.id || p.lid || p.participant))
    .filter(Boolean))];
}

export function getOwnerFund() {
  return Number(db.prepare('SELECT tokens FROM owner_fund WHERE id=1').get()?.tokens || 0);
}

export function claimOwnerFund() {
  const amount = getOwnerFund();
  if (amount > 0) db.prepare('UPDATE owner_fund SET tokens=0 WHERE id=1').run();
  return amount;
}

export function withdrawOwnerFund(amount) {
  const value = Math.max(0, Math.trunc(Number(amount)));
  if (!value) return 0;

  const result = db.prepare(
    'UPDATE owner_fund SET tokens=tokens-? WHERE id=1 AND tokens>=?'
  ).run(value, value);

  return result.changes > 0 ? value : 0;
}

export function addOwnerFund(amount) {
  const value = Math.max(0, Math.trunc(amount));
  if (!value) return getOwnerFund();
  db.prepare('INSERT INTO owner_fund(id,tokens) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET tokens=tokens+excluded.tokens').run(value);
  return getOwnerFund();
}

export function distributeGroupPurchase({ amount, groupJid, metadata }) {
  const price = Math.max(0, Math.trunc(Number(amount)));
  if (!price) return { tax: 0, adminTotal: 0, ownerTotal: 0, admins: [] };

  const tax = Math.floor(price * getGroupTax(groupJid) / 100);
  const ownerTotal = price - tax;
  const admins = getGroupAdminJids(metadata);

  if (!admins.length) {
    addOwnerFund(price);
    return { tax, adminTotal: 0, ownerTotal: price, admins: [] };
  }

  const base = Math.floor(tax / admins.length);
  let remainder = tax - base * admins.length;

  for (const jid of admins) {
    const share = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    if (share > 0) {
      ensureUser(jid, jid.split('@')[0]);
      addTokens(jid, share);
    }
  }

  if (ownerTotal > 0) addOwnerFund(ownerTotal);
  return { tax, adminTotal: tax, ownerTotal, admins };
}

export { MAX_TAX };
