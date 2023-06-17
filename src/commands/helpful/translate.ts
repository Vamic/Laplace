import { SlashCommandBuilder, SlashCommandStringOption, Interaction, Message, Client } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent, extractOptions } from "../../util/message-helpers";
import { error } from "../../util/log";

async function translate(client: Client, input: string, from: string | undefined, to: string) {
    if (!client.storage?.translate) {
        throw "Language command was not initialized properly";
    }

    const { google, languages } = client.storage!.translate;
    const languageCodes = languages.map(x => x.code);

    if (languages && languageCodes.indexOf(to) == -1)
        throw "No such language: " + to;

    if (!from) {
        return await google.translate(input, { to });
    }

    if (languages && languageCodes.indexOf(from) == -1)
        throw "No such language: " + from;

    return await google.translate(input, { from, to });
}

function getInput(action: Interaction | Message): { input: string, from?: string, to: string } {
    const res: { input: string, from?: string, to: string } = { input: "", to: "en" };
    if (action instanceof Message) {
        res.input = extractContent(action);
        const mods = extractOptions(action);
        res.to = mods.shift() || "en";
        if (mods.length > 0) {
            res.from = res.to;
            res.to = mods.shift()!;
        }
    }
    if ('options' in action) {
        res.input = action.options.get("input")?.value as string;
        res.from = action.options.get("from")?.value as string;
        res.to = action.options.get("to")?.value as string || "en";
    }
    return res;
}

const Translate: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Roll dice!')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("text to translate"))
        .addStringOption(new SlashCommandStringOption()
            .setRequired(false)
            .setName("from")
            .setDescription("language to translate from"))
        .addStringOption(new SlashCommandStringOption()
            .setRequired(false)
            .setName("to")
            .setDescription("language to translate to, default `en`")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const { action } = trigger;

        var { input, from, to } = getInput(action);
        if (!input) {
            await trigger.followUpOrReply({ content: "Usage: `!trans rotfrukt`", ephemeral: true });
            return;
        }

        try {
            let [result, metadata] = await translate(action.client, input, from, to);
            if (!from) from = metadata?.data?.translations?.[0]?.detectedSourceLanguage;
            let response = `Translated \`${input}\` (${from}-${to}): ${result}`;
            await trigger.reply(response);
        }
        catch (err) {
            error(err as any);
            if (typeof err == "string") {
                await trigger.reply(err);
                return;
            }
            await trigger.reply("Got some unkown error.");
        }
    }
}

export default { command: Translate };