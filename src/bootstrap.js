import 'dotenv/config';
import fs from 'node:fs';
import { initializeSupabasePersistence } from './services/supabase-persistence.js';

const lockPath = `/tmp/togi-bot-${typeof process.getuid === 'function' ? process.getuid() : 'user'}.lock`;
let ownsLock = false;

function acquireLock() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = fs.openSync(lockPath, 'wx', 0o600);
      fs.writeFileSync(fd, String(process.pid));
      fs.closeSync(fd);
      ownsLock = true;
      return;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;

      let existingPid = 0;
      try {
        existingPid = Number(fs.readFileSync(lockPath, 'utf8').trim());
      } catch {}

      if (existingPid > 0) {
        try {
          process.kill(existingPid, 0);
          console.error(`❌ Já existe uma instância do Togi rodando (PID ${existingPid}).`);
          process.exit(73);
        } catch (checkError) {
          if (checkError?.code === 'EPERM') {
            console.error(`❌ Já existe uma instância do Togi rodando (PID ${existingPid}).`);
            process.exit(73);
          }
        }
      }

      try { fs.unlinkSync(lockPath); } catch {}
    }
  }

  throw new Error('Não foi possível adquirir o lock de instância do Togi.');
}

function releaseLock() {
  if (!ownsLock) return;
  try {
    const pid = Number(fs.readFileSync(lockPath, 'utf8').trim());
    if (pid === process.pid) fs.unlinkSync(lockPath);
  } catch {}
  ownsLock = false;
}

acquireLock();
process.once('exit', releaseLock);
process.once('SIGINT', () => { releaseLock(); process.exit(130); });
process.once('SIGTERM', () => { releaseLock(); process.exit(143); });

await initializeSupabasePersistence();
await import('./index.js');
