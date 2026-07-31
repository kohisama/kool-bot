import { Collection, Client } from 'discord.js';
import { SlashCommand, MessageCommand } from '@/types.js';
import { MessageCommandName } from '@/constants.js';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LoadedCommands {
  slashCommands: Collection<string, SlashCommand>;
  messageCommands: Record<MessageCommandName, MessageCommand>;
}

/**
 * Recursively scans a directory for .ts/.js files and imports their default exports.
 */
async function importCommandFiles(dir: string): Promise<unknown[]> {
  const entries = readdirSync(dir);
  const modules: unknown[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      const subModules = await importCommandFiles(fullPath);
      modules.push(...subModules);
    } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
      try {
        const mod = await import(`file://${fullPath}`);
        modules.push(mod);
      } catch (error) {
        console.error(`✗ Failed to import command file ${entry}:`, error);
      }
    }
  }

  return modules;
}

function isSlashCommand(obj: unknown): obj is SlashCommand {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'data' in obj &&
    typeof (obj as SlashCommand).execute === 'function'
  );
}

function isMessageCommand(obj: unknown): obj is MessageCommand {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as MessageCommand).execute === 'function' &&
    !('data' in obj)
  );
}

/**
 * Registers commands found in a single imported module.
 */
function registerCommandModule(
  mod: unknown,
  slashCommands: Collection<string, SlashCommand>,
  messageCommands: Record<MessageCommandName, MessageCommand>,
): void {
  const maybeDefault = (mod as { default?: unknown }).default;
  const candidates: unknown[] = maybeDefault !== undefined ? [maybeDefault] : Object.values(mod as object);

  for (const cmd of candidates) {
    if (isSlashCommand(cmd)) {
      if (slashCommands.has(cmd.data.name)) {
        console.warn(`⚠ Duplicate slash command name: ${cmd.data.name}`);
      }
      slashCommands.set(cmd.data.name, cmd);
      console.log(`✓ Loaded slash command: /${cmd.data.name}`);
    } else if (isMessageCommand(cmd)) {
      if (messageCommands[cmd.name]) {
        console.warn(`⚠ Duplicate message command name: ${cmd.name}`);
      }
      messageCommands[cmd.name] = cmd;
      console.log(`✓ Loaded message command: ${cmd.name}`);
    }
  }
}

/**
 * Dynamically loads all command files from `src/commands/`.
 */
export async function loadCommands(): Promise<LoadedCommands> {
  const slashCommands = new Collection<string, SlashCommand>();
  const messageCommands = {} as Record<MessageCommandName, MessageCommand>;

  const commandsDir = join(__dirname, '../commands');
  const modules = await importCommandFiles(commandsDir);

  for (const mod of modules) {
    registerCommandModule(mod, slashCommands, messageCommands);
  }

  return { slashCommands, messageCommands };
}

/**
 * Attaches loaded commands to the Discord client.
 * Slash commands go into the already-typed `client.commands` Collection.
 * Message commands are stored on the client for event handlers to access.
 */
export async function registerCommands(client: Client): Promise<void> {
  const { slashCommands, messageCommands } = await loadCommands();

  client.commands = slashCommands;
  (client as Client & { messageCommands: Record<MessageCommandName, MessageCommand> }).messageCommands =
    messageCommands;
}
