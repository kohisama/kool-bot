# Contributing: Adding Commands to kool-bot

## Quick Reference

| Command Type          | What You Do                      | Files To Touch                                              |
| --------------------- | -------------------------------- | ----------------------------------------------------------- |
| **Slash** (`/name`)   | Create 1 file                    | `src/commands/slash/your-command.ts`                        |
| **Message** (`!name`) | Create 1 file + add 1 enum entry | `src/commands/message/your-command.ts`, `src/constants.ts`  |
| **Slash + API**       | Create 2 files                   | `src/commands/slash/your-command.ts`, `src/lib/your-api.ts` |

---

## Architecture

The bot **auto-discovers** commands — no barrel files, no manual registration. Drop a `.ts` file in the right folder and it loads on next restart.

```
src/
├── commands/
│   ├── slash/          ← drop slash commands here (auto-loaded)
│   │   └── ping.ts
│   └── message/        ← drop message commands here (auto-loaded)
│       └── ping.ts
├── lib/                ← API clients, business logic, utilities
│   └── (your service).ts
├── events/             ← Discord event handlers (auto-loaded)
├── utils/
│   ├── loadCommands.ts ← dynamic command loader (don't edit)
│   └── loadEvents.ts   ← dynamic event loader (don't edit)
├── config.ts
├── constants.ts
├── deploy-commands.ts  ← standalone script to push slash commands to Discord
├── index.ts            ← entry point
└── types.ts            ← shared TypeScript types
```

**Key principle**: `loadCommands.ts` recursively scans `commands/slash/` and `commands/message/` at startup, imports every `.ts` file, and registers what it finds. You never touch loader files — just drop your command file in the right folder.

---

## Adding a Slash Command

### 1. Create the file

Create a `.ts` file in `src/commands/slash/`. You can nest subdirectories freely (e.g., `slash/fun/`, `slash/moderation/`).

```ts
// src/commands/slash/hello.ts
import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '@/types.js';

const helloCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Say hello to the bot!')
    .addUserOption((option) =>
      option.setName('target').setDescription('The user to greet').setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('target') ?? interaction.user;
    await interaction.reply(`👋 Hello, ${target.username}!`);
  },
};

export default helloCommand;
```

### 2. Deploy

Run `npm run deploy:commands` to register your new slash command with Discord. (You only need this after adding/changing slash command **definitions**, not message commands.)

### 3. Restart

Restart the bot (`npm run dev`). Your command is live — no other changes needed.

---

## Adding a Message Command

Message commands use a prefix (default: `!`) and are typed via the `MessageCommandName` enum.

### 1. Add the enum entry

Open `src/constants.ts` and add your command name:

```ts
export enum MessageCommandName {
  Ping = 'ping',
  Hello = 'hello', // ← add this
}
```

### 2. Create the file

```ts
// src/commands/message/hello.ts
import type { Message } from 'discord.js';
import type { MessageCommand } from '@/types.js';
import { MessageCommandName } from '@/constants.js';

const helloCommand: MessageCommand = {
  name: MessageCommandName.Hello,
  description: 'Say hello!',

  async execute(message: Message) {
    const username = message.author.username;
    await message.reply(`👋 Hello, ${username}!`);
  },
};

export default helloCommand;
```

### 3. Restart

Restart the bot. No deploy step needed — message commands don't use Discord's REST API. Your command is live at `!hello`.

---

## Commands That Call External APIs

When a command needs to fetch data from an external service (weather, database, AI, etc.), **keep the command file thin** — Discord-specific glue only. Put API logic in `src/lib/`.

### Recommended structure

```
src/
├── lib/
│   └── weather.ts              ← API client: fetch, parse, cache, error handling
├── commands/
│   └── slash/
│       └── fun/
│           └── weather.ts       ← Discord glue: options, reply formatting
```

### Example: `/weather` command

**Step 1 — Create the API client** (`src/lib/weather.ts`):

```ts
// src/lib/weather.ts

interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}

const API_KEY = process.env.WEATHER_API_KEY ?? '';
const BASE_URL = 'https://api.weatherapi.com/v1';

export class WeatherApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

export async function getWeather(city: string): Promise<WeatherResult> {
  if (!API_KEY) {
    throw new WeatherApiError('Weather API key is not configured');
  }

  const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new WeatherApiError(`Weather API returned ${response.status}`, response.status);
  }

  const data = (await response.json()) as {
    location: { name: string };
    current: { temp_c: number; condition: { text: string }; humidity: number };
  };

  return {
    location: data.location.name,
    temperature: data.current.temp_c,
    condition: data.current.condition.text,
    humidity: data.current.humidity,
  };
}
```

**Step 2 — Create the command** (`src/commands/slash/fun/weather.ts`):

```ts
// src/commands/slash/fun/weather.ts
import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '@/types.js';
import { getWeather, WeatherApiError } from '@/lib/weather.js';

const weatherCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get current weather for a city')
    .addStringOption((option) => option.setName('city').setDescription('City name').setRequired(true)),

  async execute(interaction) {
    const city = interaction.options.getString('city', true);

    // Defer the reply since API calls can take time (>3 seconds)
    await interaction.deferReply();

    try {
      const weather = await getWeather(city);
      await interaction.editReply(
        `🌤 **${weather.location}**\n` +
          `🌡 Temperature: ${weather.temperature}°C\n` +
          `💧 Humidity: ${weather.humidity}%\n` +
          `☁ Conditions: ${weather.condition}`,
      );
    } catch (error) {
      if (error instanceof WeatherApiError) {
        await interaction.editReply(`❌ Could not fetch weather: ${error.message}`);
      } else {
        console.error('Unexpected error in weather command:', error);
        await interaction.editReply('❌ An unexpected error occurred.');
      }
    }
  },
};

export default weatherCommand;
```

**Step 3 — Add the API key** to `.env`:

```
WEATHER_API_KEY=your_key_here
```

**Step 4 — Deploy and restart**:

```bash
npm run deploy:commands
npm run dev
```

### API command checklist

- [ ] API logic lives in `src/lib/`, **not** in the command file
- [ ] Command defers the reply (`interaction.deferReply()`) for slow APIs
- [ ] API errors are caught and surfaced as user-friendly messages
- [ ] API keys come from `process.env` (add to `.env` / `.env.example`)
- [ ] Custom error classes make error handling clean in commands

---

## Directory Conventions When Scaling

When you have many commands, organize by category using subdirectories:

```
src/commands/
├── slash/
│   ├── info/
│   │   ├── ping.ts
│   │   ├── uptime.ts
│   │   └── serverinfo.ts
│   ├── fun/
│   │   ├── 8ball.ts
│   │   └── weather.ts
│   └── moderation/
│       ├── ban.ts
│       ├── kick.ts
│       └── purge.ts
└── message/
    ├── ping.ts
    └── hello.ts

src/lib/
├── weather.ts
├── database.ts
└── ai-client.ts
```

Subdirectories are scanned recursively — no depth limit. The folder name doesn't affect command behavior; it's purely for organization.

---

## Summary

| Task                       | What to do                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Add slash command          | Create `src/commands/slash/<name>.ts` with `export default { data, execute }`, then `npm run deploy:commands`                             |
| Add message command        | Add entry to `MessageCommandName` enum in `constants.ts`, create `src/commands/message/<name>.ts` with `export default { name, execute }` |
| Add API-backed command     | Create API client in `src/lib/<service>.ts`, command in `src/commands/slash/<name>.ts`, add API key to `.env`                             |
| Change a command's options | Edit the command file, then `npm run deploy:commands`                                                                                     |
| Delete a command           | Delete the file, restart. (Slash commands linger on Discord until you redeploy without them.)                                             |

**You should never need to edit**: `loadCommands.ts`, `loadEvents.ts`, `index.ts`, `interactionCreate.ts`, or `messageCreate.ts` when just adding or removing commands.
