import { Message } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { error } from "../../util/log";
const math = require('mathjs');

const isOperatorMath = /^-?\(?-?(\d+(?:.\d+)?i?|e|ph?i)\)? ?([<>=]=|[-+*%/^><!]) ?-?\(?-?(\d+(?:.\d+)?i?|e|ph?i)/i;
const isConversionMath = /(?:(?:\d+'\d{1,2}"?|^-?\d* ?\w+) to \w+)$/;

const QuickMath: BotCommand = {
    command: { name: "QuickMath" },

    matchOnCanExecute: true,

    canExecute: ({ action }) => {
        if (!(action instanceof Message) || !isNaN(action.content as any)) {
            return false;
        }
        return isOperatorMath.test(action.content) || isConversionMath.test(action.content);
    },

    execute: async (trigger) => {
        const { action } = trigger;

        if (!(action instanceof Message)) {
            return;
        }

        let oinput;
        let input = oinput = action.content;
        let isConversion = isConversionMath.test(input);
        let isOperator = isOperatorMath.test(input);
        if (!isOperator && !isConversion) return error("quickmaffs triggered even though its not math");

        if (isConversion) {
            let numericalFeet = /(\d+'\d{1,2})"?/;
            if (numericalFeet.test(input)) {
                let feet = numericalFeet.exec(input)![1]!.split("'");
                input = input.replace(numericalFeet, `${Number(feet[0]) + Number(feet[1]) / 12} feet`);
            }
            input = input.replace(/c (to|in) f/gi, "celsius to fahrenheit")
                .replace(/f (to|in) c/gi, "fahrenheit to celsius");
        }
        try {
            let result = math.evaluate(input);
            if (result && result.entries) {
                if (!result.entries.length) return;
                result = result.entries[0];
            }
            if (typeof result === 'object') {
                const split = (result.toString()).split(" ");
                result = Math.round(split[0] * 100) / 100 + " " + split[1];
            }
            else if (typeof result === 'number')
                result = Math.round(result * 10000) / 10000;
            const response = "`" + oinput + "` is **" + result + "**";
            const suffix = typeof result === 'number' ? "   _quick maffs_" : "";
            await trigger.reply(response.replace(/\s\s+/g, ' ') + suffix);
        } catch (e) {
            error("[quickmaffs] " + e);
        }
    }
}

export default { command: QuickMath };