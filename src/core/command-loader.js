import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsRoot = path.resolve(__dirname, '../commands');

export async function loadCommands() {
  const commands = new Map();

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.js')) {
        const mod = await import(`${pathToFileURL(full).href}?v=${Date.now()}`);
        const command = mod.default;
        if (!command?.name || typeof command.execute !== 'function') continue;
        commands.set(command.name, command);
        for (const alias of command.aliases || []) commands.set(alias, command);
      }
    }
  }

  await walk(commandsRoot);
  return commands;
}
