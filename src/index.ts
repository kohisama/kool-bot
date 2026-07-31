import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { loadEvents } from '@/utils/loadEvents.js';
import { registerCommands } from '@/utils/loadCommands.js';

// The `Client.commands` type augmentation lives in types.ts.

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    // Add more intents as needed
  ],
});

// Load all events dynamically
client.once(Events.ClientReady, async (c) => {
  console.log(`✓ Ready! Logged in as ${c.user.tag}`);
});

await loadEvents(client);
await registerCommands(client);

try {
  await client.login(config.token);
} catch (error) {
  console.error('[bot] Failed to start:', error);
  process.exit(1);
}
