'use strict';

const { DatabaseSync } = require('node:sqlite');

class Database {
  constructor(filename, options = {}) {
    this._db = new DatabaseSync(filename, {
      readOnly: Boolean(options.readonly),
      enableForeignKeyConstraints: false
    });
  }

  exec(sql) {
    return this._db.exec(sql);
  }

  prepare(sql) {
    return this._db.prepare(sql);
  }

  pragma(sql) {
    return this._db.prepare(`PRAGMA ${sql}`).all();
  }

  transaction(fn) {
    return (...args) => {
      this._db.exec('BEGIN');
      try {
        const result = fn(...args);
        this._db.exec('COMMIT');
        return result;
      } catch (error) {
        try { this._db.exec('ROLLBACK'); } catch {}
        throw error;
      }
    };
  }

  close() {
    return this._db.close();
  }
}

module.exports = Database;
