import 'dotenv/config';

/**
 * Centralised application configuration loaded from environment variables.
 * Copy `.env.example` to `.env` and fill in your bot credentials.
 */
export const config = {
  /** Bot token used to authenticate with the Discord API. */
  token: process.env.DISCORD_TOKEN ?? '',
  /** Application (client) ID, required to register slash commands. */
  clientId: process.env.CLIENT_ID ?? '',
  /** Guild ID used when deploying commands to a single server (dev). */
  guildId: process.env.GUILD_ID ?? '',
  /** Optional bot status/presence. */
  status: process.env.BOT_STATUS ?? 'online',
} as const;

if (!config.token) {
  throw new Error(
    'DISCORD_TOKEN is missing. Create a `.env` file from `.env.example` and add your bot token.',
  );
}
