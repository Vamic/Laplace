import { Message, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';

const Resume: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playing the current track'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist) {
            await trigger.followUpOrReply({ content: "Nothing to resume.", ephemeral: true });
            return;
        }

        if (!playlist.current) {
            if (playlist.hasNext()) {
                playlist.next();
            } else {
                trigger.reply("No songs in queue.");
                return;
            }
        }
        playlist.resume();
        await trigger.reply("Resumed.");
    }
}

export default { command: Resume };