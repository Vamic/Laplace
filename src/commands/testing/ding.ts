import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";

const Ding: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('ding')
        .setDescription('Replies with dong (tts)'),

    canExecute: isRepliable,

    execute: async (trigger) => {
        await trigger.reply({ content: "dong", tts: true });
    }
}

export default { command: Ding };