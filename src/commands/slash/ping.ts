import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '@/types.js';

const pingSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  async execute(interaction) {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`Pong! Latency is ${latency}ms.`);
  },
};

export default pingSlashCommand;
