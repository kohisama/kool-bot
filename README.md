# kool-bot

A Discord bot built with [discord.js](https://discord.js.org) v14 and **TypeScript**.

## Features

- ⚡ Modern **ESM + TypeScript** setup (no bundler needed)
- 🧩 Auto-loading slash commands and events (just drop a file in `src/commands` or `src/events`)
- 🎛️ Slash command deployment script (guild-local for dev, global for production)
- 🔒 Centralised config via `.env`

## Prerequisites

- [Node.js](https://nodejs.org) 18.17.0 or newer
- A Discord application + bot token from the [Developer Portal](https://discord.com/developers/applications)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure the bot**

   ```bash
   cp .env.example .env
   ```

   Then fill in your values in `.env`:

   | Variable        | Description                                                 |
   | --------------- | ----------------------------------------------------------- |
   | `DISCORD_TOKEN` | Your bot token (Developer Portal → Bot → Reset Token)       |
   | `CLIENT_ID`     | Application ID (Developer Portal → General Information)     |
   | `GUILD_ID`      | A server ID to deploy commands to instantly (dev, optional) |

3. **Invite the bot** to your server with the `applications.commands` and `bot` scopes.

4. **Deploy slash commands**

   ```bash
   npm run deploy:commands
   ```

5. **Run the bot**

   ```bash
   # Development (auto-reload on file changes)
   npm run dev

   # Production
   npm run build && npm start
   ```

## Project structure

```text
kool-bot/
├── src/
│   ├── index.ts              # Entry point — creates the client, registers commands/events
│   ├── config.ts             # Environment-based configuration
│   ├── types.ts              # Shared Command / Event types + Client augmentation
│   ├── deploy-commands.ts    # Standalone script to register slash commands with Discord
│   ├── commands/
│   │   └── ping.ts           # Example command (auto-loaded from this folder)
│   ├── events/
│   │   ├── ready.ts          # Fires once when the bot is online
│   │   └── interactionCreate.ts  # Routes interactions to commands
│   └── utils/
│       ├── registerCommands.ts   # loadCommands + deployCommands + registerCommands
│       └── loadEvents.ts         # Auto-loads and binds event files
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Adding a command

Create a new file in `src/commands/`, e.g. `src/commands/echo.ts`:

```ts
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';

export default {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input.')
    .addStringOption((option) =>
      option.setName('message').setDescription('The text to echo').setRequired(true),
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message', true);
    await interaction.reply(message);
  },
} satisfies Command;
```

Then restart the bot and re-run `npm run deploy:commands`.

## Adding an event

Create a new file in `src/events/`, e.g. `src/events/guildCreate.ts`:

```ts
import type { Event } from '../types.js';

export default {
  name: 'guildCreate',
  execute(guild) {
    console.log(`[bot] Joined guild: ${guild.name}`);
  },
} satisfies Event<'guildCreate'>;
```

## Scripts

| Script                    | Description                                  |
| ------------------------- | -------------------------------------------- |
| `npm run dev`             | Run with hot-reload (tsx watch)              |
| `npm run build`           | Compile TypeScript to `dist/`                |
| `npm start`               | Run the compiled bot                         |
| `npm run deploy:commands` | Register slash commands with the Discord API |
