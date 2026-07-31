import { Interaction, Events } from 'discord.js';
import { BotEvent } from '@/types.js';

async function handleInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing slash command ${interaction.commandName}:`, error);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ An error occurred while executing this command.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while executing this command.',
          ephemeral: true,
        });
      }
    } catch {
      console.error('Failed to send error message to user');
    }
  }
}

export default {
  name: Events.InteractionCreate,
  execute: handleInteraction,
} as BotEvent;
