import { Interaction, Message, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent } from "../../util/message-helpers";

function getInput(action: Interaction | Message): string | undefined {
    if (action instanceof Message) {
        return extractContent(action);
    }
    if ('options' in action) {
        return (action.options.get("input")?.value as string);
    }
    return;
}

const UrbanDictionary: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Finds a definition on Urban Dictionary')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("term to find")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const input = getInput(trigger.action);
        if (!input) {
            trigger.reply("Gonna need something to define");
            return;
        }
        const data = await fetch("http://api.urbandictionary.com/v0/define?term=" + encodeURIComponent(input)).then(x => x.json());
        if (!data) return;
        if (data.error) {
            trigger.reply("Urbandictionary says " + data.error);
            return;
        }
        if (data.list.length < 1) {
            trigger.reply("Not even I know what that is! Are you sure it exists? :0");
            return;
        }

        var text = "**[" + data.list[0].word + "]**\n\n" + data.list[0].definition;

        await trigger.reply(text);
    }
}

export default { command: UrbanDictionary };