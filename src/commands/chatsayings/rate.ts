import { Interaction, Message, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent } from "../../util";
import Rand from 'rand-seed';

function getInput(action: Interaction | Message): string | undefined {
    if (action instanceof Message) {
        return extractContent(action);
    }
    if ('options' in action) {
        return (action.options.get("input")?.value as string);
    }
    return;
}

const Quest: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('rate')
        .setDescription('Gives a rating to something')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("thing to rate")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const input = getInput(trigger.action);
        const rand = new Rand("hello" + input?.toLowerCase());
        var rating = 10 * rand.next();
        if (rating < 9.5) {
            trigger.reply(input + " is decidedly trash.");
        } else {
            trigger.reply(input + " is a " + Math.round(rating * 10) / 10 + "/10. Acceptable.");
        }
    }
}

export default { command: Quest };