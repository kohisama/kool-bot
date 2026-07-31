import type {
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  Collection,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import { MessageCommandName } from './constants.js';

/** A single slash command: schema definition + execution handler. */
export interface SlashCommand {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
}

/** A single prefix (message) command. */
export interface MessageCommand {
  name: MessageCommandName;
  description: string;
  execute: (message: Message) => Promise<void> | void;
}

/**
 * A Discord client event. `K` is the event name; `execute` receives the exact
 * argument tuple discord.js provides for that event, so handlers are fully typed.
 */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, SlashCommand>;
  }
}

// Keep `Client` referenced so the augmentation stays attached to the module.
export type DiscordClient = Client;
