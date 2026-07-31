---
name: kool-bot-contributing
description: 'kool-bot project conventions for adding Discord bot features (slash commands, message commands, API-backed commands, events). Use when: adding new commands, modifying bot behavior, creating features for this project, or any code change under src/commands/, src/events/, src/lib/, or src/utils/.'
---

# kool-bot Contributing

## When to Use test

Activate this skill whenever the user asks to add, modify, or refactor features in the **kool-bot** Discord bot project — especially commands, events, API integrations, or structural changes.

## Procedure

### 1. Read CONTRIBUTING.md first

Before writing any code, read the project conventions:

[CONTRIBUTING.md](../../docs/CONTRIBUTING.md)

This file defines:
- How to add slash commands (`/name`) — drop a `export default { data, execute }` file in `src/commands/slash/`
- How to add message commands (`!name`) — drop a file in `src/commands/message/` + add to `MessageCommandName` enum
- How to structure API-backed commands — `src/lib/<service>.ts` for business logic, thin command files for Discord glue
- Directory conventions for scaling (subdirectories by category)
- The deploy flow (`npm run deploy:commands`)

### 2. Follow project conventions

Key rules to follow:

- **Commands use `export default`**, matching the `loadEvents.ts` convention
- **No barrel files** — commands are auto-discovered, never manually registered
- **Never edit loader files** (`loadCommands.ts`, `loadEvents.ts`) when just adding features
- **API logic goes in `src/lib/`**, not in command files
- **Message commands need a `MessageCommandName` enum entry** in `src/constants.ts`
- **Build with `npm run build`** to verify TypeScript compiles cleanly before considering work done

### 3. Build and verify

After making changes, always run:

```bash
npm run build
```

Fix any TypeScript errors before completing the task.

## Project Stack

- discord.js v14, TypeScript (ESM, `"type": "module"`), tsx for dev
- ESM imports use `.js` extensions (`import './config.js'`)
- Path alias: `@/` → `src/` (configured in `tsconfig.json`)
