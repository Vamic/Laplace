import { SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';

const Clear: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear all queued tracks'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist) {
            await trigger.followUpOrReply({ content: "Nothing to clear.", ephemeral: true });
            return;
        }

        playlist.destroy();
        await trigger.reply("Cleared all songs.");
    }
}

export default { command: Clear };