import { Client } from 'discord.js';
import { BotEvent } from '@/types.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadEvents(client: Client): Promise<void> {
  const eventsDir = join(__dirname, '../events');
  const eventFiles = readdirSync(eventsDir).filter((file) => file.endsWith('.ts'));

  for (const file of eventFiles) {
    const filePath = join(eventsDir, file);
    try {
      const eventModule = await import(`file://${filePath}`);
      const event: BotEvent = eventModule.default;

      if (!event || !event.name || !event.execute) {
        console.warn(`Event file ${file} is missing required properties`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      console.log(`✓ Loaded event: ${event.name}`);
    } catch (error) {
      console.error(`✗ Failed to load event ${file}:`, error);
    }
  }
}
