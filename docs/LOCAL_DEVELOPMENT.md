# Local Development & Testing

How to run kool-bot locally for development and testing.

---

## Prerequisites

- **Node.js** 18.17.0 or newer ([download](https://nodejs.org))
- **npm** (comes with Node.js)
- A **Discord account** and a server where you have **Manage Server** permission (or create your own test server)

---

## 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → give it a name (e.g., `kool-bot-dev`)
3. Go to the **Bot** tab on the left sidebar
4. Click **Reset Token** (or **View Token**) and copy it — you'll need this for `.env`
5. Under **Privileged Gateway Intents**, enable:
   - **Message Content Intent** (required for message commands)
   - **Server Members Intent** (if using member-related features)

### Get your IDs

- **Application ID**: Go to **General Information** → copy the **Application ID**
- **Guild ID**: In Discord, enable **Developer Mode** (User Settings → App Settings → Advanced), then right-click your test server → **Copy Server ID**

---

## 2. Invite the Bot to Your Test Server

Construct this URL (replace `YOUR_CLIENT_ID`):

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```

Open it in a browser, select your test server, and authorize.

> **Permissions note**: `2147485696` covers Send Messages, Read Message History, Use Slash Commands, and basic moderation. Adjust as needed in the Portal under OAuth2 → URL Generator.

---

## 3. Clone & Install

```bash
git clone <repo-url> kool-bot
cd kool-bot
npm install
```

---

## 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DISCORD_TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-guild-id-here
```

---

## 5. Deploy Slash Commands

Slash commands must be registered with Discord before they appear. Run:

```bash
npm run deploy:commands
```

Expected output:

```
Deploying 1 slash command(s)...
✅ Slash commands deployed!
```

> Run this again whenever you add, rename, or change options on a slash command. Message commands don't need this step.

---

## 6. Start the Bot

### Development mode (hot reload)

```bash
npm run dev
```

Uses `tsx watch` — automatically restarts when you edit files.

Expected output:

```
✓ Loaded event: ready
✓ Loaded event: interactionCreate
✓ Loaded event: messageCreate
✓ Loaded slash command: /ping
✓ Loaded message command: ping
✓ Ready! Logged in as kool-bot-dev#1234
```

### Production build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs compiled JS
```

---

## 7. Test Your Commands

In your Discord test server:

| Command | Expected Response       |
| ------- | ----------------------- |
| `/ping` | `Pong! Latency is Xms.` |
| `!ping` | `Pong! Latency is Xms.` |

If `/ping` doesn't appear in the slash command menu, re-run `npm run deploy:commands` and wait a few seconds for Discord to propagate the registration.

---

## 8. Development Workflow

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Edit code    │ ──▶ │  Auto-restarts    │ ──▶ │  Test in Discord │
│  (src/*.ts)   │     │  (tsx watch)     │     │  (/cmd or !cmd) │
└──────────────┘     └──────────────────┘     └─────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │  Slash cmd change? │──yes──▶ npm run deploy:commands
                  └───────────────────┘
```

- **Message commands**: edit → save → auto-restart → test immediately
- **Slash command code** (execute handler): edit → save → auto-restart → test immediately
- **Slash command definition** (name, description, options): edit → save → `npm run deploy:commands` → test

---

## Troubleshooting

| Symptom                           | Likely Cause                         | Fix                                                     |
| --------------------------------- | ------------------------------------ | ------------------------------------------------------- |
| `Missing environment variables`   | `.env` not created or missing values | Run `cp .env.example .env` and fill in all fields       |
| Bot online but not responding     | Missing intents                      | Enable Message Content Intent in Developer Portal → Bot |
| `/ping` doesn't appear            | Slash commands not deployed          | Run `npm run deploy:commands`                           |
| `!ping` silently ignored          | Bot lacks Message Content Intent     | Enable it in the Portal, re-invite the bot if needed    |
| `Error [TOKEN_INVALID]`           | Wrong or revoked token               | Reset token in Developer Portal → Bot, update `.env`    |
| `Missing Access` on slash command | Bot not in server, or wrong guild ID | Verify `GUILD_ID` in `.env` matches your test server    |
| TypeScript compile errors         | Syntax or type issues                | Run `npm run build` to see errors, fix, then re-run     |

### Quick sanity checks

```bash
# Verify .env exists and has values (should not show "your-...")
cat .env

# Verify TypeScript compiles
npm run build

# Check Node version (needs ≥18.17)
node --version
```

---

## Multiple Test Bots

If you work on multiple features, create separate Discord applications so you can test in isolation:

1. Create a second application in the Developer Portal
2. Use a separate `.env.dev2` file
3. Run with: `cp .env.dev2 .env && npm run dev`

---

## Next Steps

- [Adding commands](./CONTRIBUTING.md) — how to add slash, message, and API-backed commands
- [Discord.js Guide](https://discordjs.guide) — official discord.js documentation
- [Discord Developer Portal](https://discord.com/developers/applications) — manage your bot application
