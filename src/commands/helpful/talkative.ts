import { Client, Message } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { CommandTrigger } from "../../types/command-trigger";

interface Scenario {
    min: number,
    max: number,
    regex: RegExp,
    respond: (trigger: CommandTrigger, input: string) => Promise<void>
}

const scenarios: { [name: string]: Scenario } = {
    yesnoquestion: {
        min: 1,
        max: 100,
        regex: /^(?:am|are|(?:sha|wi)ll|can|did|is|(sh|w|c)ould|ha(?:ve|d)|do(?:es)?|(?:h|w)as)(?:n(?:´|`|'|’)?t)? | (?:(?:am|are|(?:sha|wi)ll|can|did|is|(sh|w|c)ould|ha(?:ve|d)|do(?:es)?|(?:h|w)as)(?:(?:n(?:´|`|'|’)?t)?)|(?:ca|wo)n(?:´|`|'|’)?t) \w+\??$|really\??/i,
        respond: async (trigger, input) => {
            input = input.replace(/\?$/, "");
            const responses = {
                yes: [
                    "Yea",
                    "Sure",
                    "Yeh",
                    "Yes"
                ],
                no: [
                    "No",
                    "No",
                    "Nope",
                    "Nah"
                ]
            };

            let response = responses.yes.concat(responses.no).rand();

            await trigger.reply(response);
        }
    },
    choicequestion: {
        min: 1,
        max: 100,
        regex: /^(\w+,? ?)*(, ?| ?or )(\w+ ?)+\??$/i,
        respond: async (trigger, input) => {
            input = input.replace(/\?$/, "");
            const options = input.split(/, ?| or /g);
            const response = [
                "Totally ",
                "Probably ",
                "I'd say "
            ].rand() + options.rand().replace(/\s\s+/g, ' ').trim() + ".";
            await trigger.reply(response);
        }
    },
    wassaaaa: {
        min: 1,
        max: 3,
        regex: /^(?:wh?at?(?:'|`|´| i)?s?s ?(?:u|a)p|sup)\??$/i,
        respond: async (trigger) => {
            const response = [
                "I wish I were a bird.",
                "Just chillin', relaxin' all cool. You?"
            ].rand();
            await trigger.reply(response);
        }
    },
    thxm8: {
        min: 1,
        max: 2,
        regex: /^(?:th(?:(?:a|e)nk)(?:s|e)|th(?:a|e)nk you|thx)$/i,
        respond: async (trigger) => {
            const name = trigger.action instanceof Message && (trigger.action.member && trigger.action.member.nickname ? trigger.action.member.nickname : trigger.action.author.username);
            const response = [
                "No problem",
                "You're welcome",
                "Any time"
            ].rand();
            await trigger.reply(response + (trigger.action.channel!.isDMBased() ? "." : " " + name + "."));
        }
    },
    greeting: {
        min: 1,
        max: 1,
        regex: /^(?:h?e(?:l|nl|y)l?o|h(?:ey|i)|yo)$/i,
        respond: async (trigger) => {
            const name = trigger.action instanceof Message && (trigger.action.member && trigger.action.member.nickname ? trigger.action.member.nickname : trigger.action.author.username);
            const response = [
                "Hello",
                "Hey",
                "Hi"
            ].rand();
            await trigger.reply(response + (trigger.action.channel!.isDMBased() ? "." : " " + name + "."));
        }
    },
    love: {
        min: 3,
        max: 3,
        regex: /^i love you$/i,
        respond: async (trigger) => {
            const response = [
                "Thank you.",
                "uwu",
                "That's nice.",
                "I know."
            ].rand();
            await trigger.reply(response);
        }
    },
    fuckyou: {
        min: 2,
        max: 2,
        regex: /^fuck you$/i,
        respond: async (trigger) => {
            await trigger.reply("Fuck you.");
        }
    }
}

function mentionsLaplace(message: Message) {
    return !!message.mentions.users.find(x => x.id == message.client.user?.id)
        || message.mentions.repliedUser?.id == message.client.user?.id
        || message.content.indexOf('laplace') > -1;
}

function findMatch(input: string): Scenario | null {
    const parts = input.split(" ");
    if (parts.length) {
        for (const obj of Object.values(scenarios)) {
            if (parts.length < obj.min) continue;
            let maxWords = parts.length > obj.max ? obj.max : parts.length;
            for (let i = 1; i <= maxWords; i++) {
                const words = parts.slice(0, i).join(" ");
                const success = obj.regex.test(words.toLowerCase());
                if (success) {
                    return obj;
                }
            }
        }
    }
    return null;
}

const Talkative: BotCommand = {
    command: { name: "Talkative" },
    matchOnCanExecute: true,
    canExecute: ({ action }) => action instanceof Message && mentionsLaplace(action) && !!findMatch(action.content),
    execute: async (trigger) => {
        const { action } = trigger;
        if (!(action instanceof Message)) {
            return;
        }
        const match = findMatch(action.content);
        if (!match) {
            return;
        }
        await match.respond(trigger, action.content);
    }
}

export default { command: Talkative };