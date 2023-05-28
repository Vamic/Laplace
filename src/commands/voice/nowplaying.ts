import { SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';
import './dj/song-extension';

const NowPlaying: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('np')
        .setDescription('See information about the current playing track'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist || playlist.length === 0) {
            await trigger.followUpOrReply({ content: "No songs in queue.", ephemeral: true });
            return;
        }

        const song = await playlist.current.initiateSongInfo(true);

        if (!song.display) {
            await trigger.reply("Failed to get info on current song.");
            return;
        }

        const { embed, thumbnail } = song.display;
        await trigger.reply({
            embeds: [embed],
            files: thumbnail ? [thumbnail] : undefined
        });
    }
}

export default { command: NowPlaying };