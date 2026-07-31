import { Message, Events } from 'discord.js';
import { MessageCommandName, COMMAND_PREFIX } from '@/constants.js';
import { MessageCommand, BotEvent } from '@/types.js';

async function handleCommand(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.content.startsWith(COMMAND_PREFIX)) return;

  const args = message.content.slice(COMMAND_PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase() as MessageCommandName;

  if (!commandName) return;

  const messageCommands = (
    message.client as typeof message.client & { messageCommands: Record<MessageCommandName, MessageCommand> }
  ).messageCommands;
  const command = messageCommands?.[commandName];

  if (!command) return;

  try {
    await command.execute(message);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    try {
      await message.reply({
        content: '❌ An error occurred while executing this command.',
        allowedMentions: { repliedUser: false },
      });
    } catch {
      console.error('Failed to send error message to user');
    }
  }
}

export default {
  name: Events.MessageCreate,
  execute: handleCommand,
} as BotEvent;
