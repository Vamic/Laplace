import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';
import './dj/song-extension';

const Queue: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('See a list of the queued tracks'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist || playlist.length === 0) {
            await trigger.followUpOrReply({ content: "No songs in queue.", ephemeral: true });
            return;
        }

        var overflow = 0;
        var responseArr: Array<string> = [];

        let nextSongs = playlist.slice(playlist.pos + 1);
        if (nextSongs.length > 10) {
            const temp = nextSongs.splice(0, 9);
            overflow = nextSongs.length;
            nextSongs = temp;
        }

        let songs = await Promise.all(nextSongs.map((song) => song.initiateSongInfo(false)));
        for (let song of songs) {
            responseArr.push("[" + song.info?.title + "](" + song.info?.url + ") added by " + song.extendedInfo?.addedBy.displayName);
        }

        if (overflow > 0) {
            responseArr.push(" . . . and " + overflow + " more.");
        }

        var embed = new EmbedBuilder()
            .setTitle("Coming up soon . . .")
            .setDescription(responseArr.length > 0 ? responseArr.join("\n") : "The sound of silence . . .");

        await trigger.reply({ embeds: [embed] });
    }
}

export default { command: Queue };