import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";

const Ping: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),

    canExecute: isRepliable,

    execute: async (trigger) => {
        await trigger.reply('pong');
    }
}

export default { command: Ping };