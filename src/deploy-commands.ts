import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { loadCommands } from './utils/loadCommands.js';

const { slashCommands } = await loadCommands();

const commands = slashCommands.map((cmd) => cmd.data.toJSON());

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_TEST_SERVER_ID;
const TOKEN = process.env.DISCORD_TOKEN;

if (!CLIENT_ID || !GUILD_ID || !TOKEN) {
  throw new Error('Missing environment variables: DISCORD_CLIENT_ID, DISCORD_TEST_SERVER_ID, DISCORD_TOKEN');
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} slash command(s)...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Slash commands deployed!');
  } catch (err) {
    console.error('Failed to deploy slash commands:', err);
    process.exit(1);
  }
})();
