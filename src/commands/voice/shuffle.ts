import { Message, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';

const Shuffle: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the currently playing track'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist) {
            await trigger.followUpOrReply({ content: "Nothing to shuffle.", ephemeral: true });
            return;
        }

        playlist.shuffle();
        await trigger.reply("Shuffled all songs.");
    }
}

export default { command: Shuffle };