import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const databasePath = process.env.DATABASE_PATH || './data/togi.sqlite';
const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stateTable = `${supabaseUrl}/rest/v1/bot_state`;

let db;
let timer = null;
let interval = null;
let syncing = false;
let pending = false;

function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  return db;
}

export function isSupabasePersistenceConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

function headers() {
  return { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' };
}

function tableNames() {
  return getDb().prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(row => row.name);
}

function encodeValue(value) {
  if (Buffer.isBuffer(value)) return { __togi_buffer: value.toString('base64') };
  return value;
}

function decodeValue(value) {
  if (value && typeof value === 'object' && value.__togi_buffer) return Buffer.from(value.__togi_buffer, 'base64');
  return value;
}

export function exportLocalSnapshot() {
  const database = getDb();
  const tables = {};
  for (const table of tableNames()) {
    const safe = table.replaceAll('"', '""');
    tables[table] = database.prepare(`SELECT * FROM "${safe}"`).all().map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, encodeValue(value)])));
  }
  return { version: 1, created_at: Date.now(), tables };
}

export function localDatabaseHasUsers() {
  const database = getDb();
  const exists = database.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (!exists) return false;
  return Number(database.prepare('SELECT COUNT(*) AS count FROM users').get().count) > 0;
}

function insertRows(table, rows) {
  if (!rows?.length) return;
  const database = getDb();
  const safeTable = table.replaceAll('"', '""');
  const columns = Object.keys(rows[0]);
  const safeColumns = columns.map(column => `"${column.replaceAll('"', '""')}"`).join(',');
  const placeholders = columns.map(() => '?').join(',');
  const statement = database.prepare(`INSERT OR REPLACE INTO "${safeTable}" (${safeColumns}) VALUES (${placeholders})`);
  const insertMany = database.transaction(items => {
    for (const row of items) statement.run(columns.map(column => decodeValue(row[column])));
  });
  insertMany(rows);
}

export function restoreLocalSnapshot(snapshot) {
  if (!snapshot?.tables || localDatabaseHasUsers()) return { restored: false, reason: 'local_data_exists' };
  const database = getDb();
  const existing = new Set(tableNames());
  const names = Object.keys(snapshot.tables).filter(name => existing.has(name));
  if (!names.length) return { restored: false, reason: 'no_matching_tables' };
  const restore = database.transaction(() => {
    database.pragma('foreign_keys = OFF');
    for (const table of [...names].reverse()) database.prepare(`DELETE FROM "${table.replaceAll('"', '""')}"`).run();
    for (const table of names) insertRows(table, snapshot.tables[table]);
    database.pragma('foreign_keys = ON');
  });
  restore();
  return { restored: true, tables: names.length };
}

async function request(pathname, options = {}) {
  const response = await fetch(`${stateTable}${pathname}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

export async function pullFromSupabase() {
  if (!isSupabasePersistenceConfigured()) return { restored: false, reason: 'not_configured' };
  try {
    const rows = await request('?id=eq.1&select=state&limit=1');
    const snapshot = rows?.[0]?.state;
    if (!snapshot) return { restored: false, reason: 'no_remote_snapshot' };
    return restoreLocalSnapshot(snapshot);
  } catch (error) {
    console.warn(`⚠️ Supabase restore indisponível: ${error.message}`);
    return { restored: false, reason: 'error' };
  }
}

export async function syncToSupabase() {
  if (!isSupabasePersistenceConfigured()) return false;
  if (syncing) { pending = true; return false; }
  syncing = true;
  try {
    const state = exportLocalSnapshot();
    await request('', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: 1, state }) });
    return true;
  } catch (error) {
    console.warn(`⚠️ Supabase sync indisponível: ${error.message}`);
    return false;
  } finally {
    syncing = false;
    if (pending) { pending = false; scheduleSupabaseSync(2000); }
  }
}

export function scheduleSupabaseSync(delayMs = 5000) {
  if (!isSupabasePersistenceConfigured()) return;
  clearTimeout(timer);
  timer = setTimeout(() => { syncToSupabase().catch(() => {}); }, Math.max(500, delayMs));
  timer.unref?.();
}

export async function initializeSupabasePersistence() {
  if (!isSupabasePersistenceConfigured()) {
    console.warn('ℹ️ Supabase Persistence desativado: configure SUPABASE_URL + SUPABASE_SECRET_KEY no .env.');
    return;
  }
  const result = await pullFromSupabase();
  if (result.restored) console.log(`☁️ Supabase: dados restaurados (${result.tables} tabelas).`);
  else if (result.reason === 'no_remote_snapshot') console.log('☁️ Supabase: primeiro boot detectado; o estado local será enviado após o uso.');
  scheduleSupabaseSync(1000);
  clearInterval(interval);
  interval = setInterval(() => { syncToSupabase().catch(() => {}); }, 30000);
  interval.unref?.();
}
