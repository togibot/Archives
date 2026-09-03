import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsRoot = path.resolve(__dirname, '../commands');

export async function loadCommands() {
  const commands = new Map();
  const aliases = [];
  const sources = new Map();

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.name.endsWith('.js')) continue;

      const mod = await import(`${pathToFileURL(full).href}?v=${Date.now()}`);
      const raw = mod.default;
      if (!raw) continue;

      // Compatibilidade com comandos antigos que usavam { command, run }.
      const name = raw.name || raw.command;
      const execute = typeof raw.execute === 'function'
        ? raw.execute
        : typeof raw.run === 'function'
          ? async (context) => raw.run(context.message, { sock: context.sock, ...context })
          : null;

      if (!name || typeof execute !== 'function') continue;

      const command = { ...raw, name, execute };
      const relative = path.relative(commandsRoot, full);
      const isRootCommand = !relative.includes(path.sep);
      const existingSource = sources.get(name);

      // Comandos na raiz são os canônicos quando existe uma cópia duplicada
      // dentro de uma subpasta. Entre comandos da mesma camada, o último
      // carregado continua tendo prioridade como antes.
      if (!existingSource || (!existingSource.isRoot && isRootCommand) || (existingSource.isRoot === isRootCommand)) {
        commands.set(name, command);
        sources.set(name, { path: relative, isRoot: isRootCommand });
      }

      for (const alias of command.aliases || []) {
        const normalized = String(alias).trim().toLowerCase();
        if (normalized) aliases.push({ alias: normalized, command });
      }
    }
  }

  await walk(commandsRoot);

  // Um alias nunca deve substituir um comando que já possui esse nome.
  // Ex.: .quiz deve usar o comando dedicado de quiz, não o alias do Arcade.
  for (const { alias, command } of aliases) {
    if (!commands.has(alias)) commands.set(alias, command);
  }

  return commands;
}
