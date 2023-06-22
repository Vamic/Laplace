import { GuildMember, Interaction, Message, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { extractContent } from '../../util/message-helpers';
import { initializeOrGetPlaylist } from './dj/util';

function extractOptions(action: Interaction | Message): { urls: Array<string>, searches: Array<string>, secret: boolean } {
    let lines: Array<string> = [];
    if (action instanceof Message) {
        lines = extractContent(action).split(/\r?\n|\r/);
    }
    let secret = false;
    if ('options' in action) {
        lines.push(action.options.get("input")?.value as string);
        secret = !!action.options.get("secret")?.value;
    }

    var urls: Array<string> = [];
    var searches: Array<string> = [];
    for (var line of lines) {
        var searchWords = [];
        var args = line.split(" ");
        for (var arg of args) {
            if (/https?:\/\/|\w+\.\w+\.\w+/g.test(arg)) {
                urls.push(arg);
            } else {
                searchWords.push(arg);
            }
        }
        if (searchWords.length) searches.push(searchWords.join(" "));
    }

    return { urls, searches, secret };
}

const Play: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Queue up audio for playback in your current voice channel')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("search query or url"))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setRequired(false)
            .setName("secret")
            .setDescription("no one will know... how would they know?")),

    canExecute: ({ action: { guildId } }) => !!guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const { member } = action;

        if (!(member instanceof GuildMember)) {
            return;
        }

        const playlist = initializeOrGetPlaylist(action.client, action.guildId!);

        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            await trigger.followUpOrReply({ content: "Couldn't find your voice channel", ephemeral: true });
            return;
        }

        const { urls, searches, secret } = extractOptions(action);

        var fetchResult = await playlist.add(urls);
        var searchResult = await playlist.add(searches, {
            playlistAddType: "searches",
        });

        var added = fetchResult.added.concat(searchResult.added);

        for (const song of added) {
            if (!song.extendedInfo) {
                song.extendedInfo = {
                    addedBy: member
                };
            }
        }

        if (added.length) {
            await playlist.start(voiceChannel);
        }

        const adder = secret ? "You silently" : member.displayName;
        const content = added.length === 1
            ? `${adder} added song: ${added[0].title}\n<${added[0].info?.url}>`
            : `${adder} added ${added.length} songs`;

        await trigger.reply({ content, ephemeral: secret }, { autoDelete: true, deleteUserMessage: true });
    }
}

export default { command: Play };