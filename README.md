# kool-bot

A Discord bot built with [discord.js](https://discord.js.org) v14 and **TypeScript**.

## Features

- ⚡ Modern **ESM + TypeScript** setup (no bundler needed)
- 🧩 **Auto-discovering** slash commands and message commands — drop a file, no registration needed
- 📂 Recursive subdirectory support for organizing commands by category
- 🔌 **Service layer** pattern (`src/lib/`) for API-backed commands
- 🎛️ Slash command deployment script (guild-local for dev)
- 🔒 Centralised config via `.env`

## Prerequisites

- [Node.js](https://nodejs.org) 18.17.0 or newer
- A Discord application + bot token from the [Developer Portal](https://discord.com/developers/applications)

## Quick Start

```bash
npm install
cp .env.example .env   # then edit .env with your token, client ID, and guild ID
npm run deploy:commands # register slash commands with Discord
npm run dev             # start with hot-reload
```

Full setup guide: [Local Development](./docs/LOCAL_DEVELOPMENT.md)

## Project Structure

```text
kool-bot/
├── src/
│   ├── index.ts                # Entry point — creates client, loads events & commands
│   ├── config.ts               # Environment-based configuration
│   ├── constants.ts            # Command prefix, message command name enum
│   ├── types.ts                # Shared types + Client.commands augmentation
│   ├── deploy-commands.ts      # Standalone script to push slash commands to Discord
│   ├── commands/
│   │   ├── slash/              # Slash commands (/name) — auto-loaded
│   │   │   └── ping.ts
│   │   └── message/            # Message commands (!name) — auto-loaded
│   │       └── ping.ts
│   ├── events/                 # Discord event handlers — auto-loaded
│   │   ├── interactionCreate.ts
│   │   └── messageCreate.ts
│   ├── lib/                    # API clients, business logic (create as needed)
│   └── utils/
│       ├── loadCommands.ts     # Dynamic command loader
│       └── loadEvents.ts       # Dynamic event loader
├── docs/
│   ├── CONTRIBUTING.md         # How to add commands
│   └── LOCAL_DEVELOPMENT.md    # Local testing setup
├── .github/skills/             # Copilot agent skills
├── .env.example
├── package.json
└── tsconfig.json
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled bot |
| `npm run deploy:commands` | Register slash commands with Discord |

## Adding Commands

Commands are **auto-discovered** — no barrel files or manual registration. Full guide: [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

### Slash command (`/name`)

Drop a file in `src/commands/slash/`:

```ts
import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '@/types.js';

const echoCommand: SlashCommand = {
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
};

export default echoCommand;
```

Then: `npm run deploy:commands` → restart.

### Message command (`!name`)

Add an entry to `MessageCommandName` in `src/constants.ts`, then drop a file in `src/commands/message/`:

```ts
import type { Message } from 'discord.js';
import type { MessageCommand } from '@/types.js';
import { MessageCommandName } from '@/constants.js';

const echoCommand: MessageCommand = {
  name: MessageCommandName.Echo,
  description: 'Replies with your input.',
  async execute(message: Message) {
    await message.reply(message.content.slice(6)); // !echo <text>
  },
};

export default echoCommand;
```

Restart — no deploy step needed.

### API-backed commands

Keep Discord glue in the command file. Put API logic in `src/lib/`:

```
src/lib/weather.ts          ← fetch, parse, error handling
src/commands/slash/fun/weather.ts  ← Discord options, reply formatting
```

Full example with error handling and `deferReply`: [CONTRIBUTING.md](./docs/CONTRIBUTING.md#commands-that-call-external-apis)

## Adding an Event

Drop a file in `src/events/`:

```ts
import type { BotEvent } from '@/types.js';

export default {
  name: 'guildCreate',
  execute(guild) {
    console.log(`Joined guild: ${guild.name}`);
  },
} as BotEvent<'guildCreate'>;
```

## Documentation

| Doc | Content |
|---|---|
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | How to add slash, message, and API-backed commands |
| [LOCAL_DEVELOPMENT.md](./docs/LOCAL_DEVELOPMENT.md) | Full local setup: Discord app, invite, env, testing |

