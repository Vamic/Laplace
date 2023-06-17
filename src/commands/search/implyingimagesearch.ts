import { EmbedBuilder, Message } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { error } from "../../util/log";
import { google } from "googleapis";
import { keys } from '../../config.json';

const customSearch = google.customsearch("v1").cse;

const searchEngineID = "002100658904403526277:rp_ixt2vd6i";

async function googleImageSearch(term: string, fileType: string) {
    if (!keys.google) {
        throw "No google api key found, can't search for images";
    }

    var result = await customSearch.list({
        q: term,
        cx: searchEngineID,
        start: Math.floor(20 * Math.random()),
        num: 1,
        searchType: "image",
        fileType: fileType,
        auth: keys.google
    });

    return result.data.items && result.data.items[0]!.link;
}

const isImplyingImageRegex = /^>(.+)\.(png|jpe?g|gif|bmp|webp|svg)$/;

const ImplyingImageSearch: BotCommand = {
    command: { name: "ImplyingImageSearch" },
    matchOnCanExecute: true,
    canExecute: ({ action }) => action instanceof Message && isImplyingImageRegex.test(action.content),
    execute: async (trigger) => {
        const { action } = trigger;
        if (!(action instanceof Message)) {
            throw "how";
        }

        var regexResult = isImplyingImageRegex.exec(action.content);
        if (!regexResult || regexResult?.length < 3) {
            throw "how??";
        }
        var fileType = regexResult[2]!;
        var search = regexResult[1]!;

        let imageUrl = await googleImageSearch(search, fileType).catch(error);
        if (!imageUrl) {
            await trigger.reply("Nobody here but us reptiles!");
            return;
        }

        if (!fileType) {
            var regres = /\.(\w{3,4})$/.exec(imageUrl);
            if (regres && regres.length > 1) {
                fileType = regres[1]!;
            } else {
                fileType = "pingas";
            }
        }
        var embed = new EmbedBuilder()
            .setImage(imageUrl)
            .setDescription(`[${search}.${fileType}](${imageUrl})`);

        await trigger.reply({ embeds: [embed] });
    }
}

export default { command: ImplyingImageSearch };