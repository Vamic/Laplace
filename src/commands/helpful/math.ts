import { Interaction, Message, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent } from "../../util/message-helpers";
const math = require('mathjs');

function getInput(action: Interaction | Message): string {
    if (action instanceof Message) {
        return extractContent(action);
    }
    if ('options' in action) {
        return (action.options.get("input")?.value as string) ?? "";
    }
    return "";
}

const SuperMath: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Do maths')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("math to math")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const { action } = trigger;
        let input = getInput(action);
        try {
            let result = math.evaluate(input);
            if (result && result.entries) {
                if (!result.entries.length) return;
                result = result.entries[0];
            }
            if (typeof result === 'object') {
                const split = (result.toString()).split(" ");
                result = Math.round(split[0] * 100) / 100 + " " + split[1] || "";
            }
            else if (typeof result === 'number')
                result = Math.round(result * 10000) / 10000;
            const response = "`" + input + "` is **" + result + "**";
            const suffix = typeof result === 'number' ? "   _advanced maffs_" : "";
            await trigger.reply(response.replace(/\s\s+/g, ' ') + suffix);
        } catch (e) {
            await trigger.reply("Bzz: " + e);
        }
    }
}

export default { command: SuperMath };