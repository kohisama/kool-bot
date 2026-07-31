import { Message } from 'discord.js';
import { MessageCommand } from '@/types.js';
import { MessageCommandName } from '@/constants.js';

const pingCommand: MessageCommand = {
  name: MessageCommandName.Ping,
  description: 'Replies with Pong!',
  async execute(message: Message) {
    const latency = Date.now() - message.createdTimestamp;
    await message.reply(`Pong! Latency is ${latency}ms.`);
  },
};

export default pingCommand;