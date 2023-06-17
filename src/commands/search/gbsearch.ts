import { Interaction, Message, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent } from "../../util/message-helpers";

function getInput(action: Interaction | Message): Array<string> {
    if (action instanceof Message) {
        return extractContent(action).split(' ');
    }
    if ('options' in action) {
        return (action.options.get("input")?.value as string)?.split(' ') ?? [];
    }
    return [];
}

const GelbooruSearch: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('searchgelbooru')
        .setDescription('Finds an image in Gelbooru')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("tags to search")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        getInput(trigger.action);
        await trigger.reply("Vamic says: I'll implement this later");
    }
}

export default { command: GelbooruSearch };