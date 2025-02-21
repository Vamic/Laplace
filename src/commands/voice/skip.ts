import { SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';

const Skip: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the currently playing track'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist) {
            await trigger.followUpOrReply({ content: "Nothing to skip.", ephemeral: true });
            return;
        }

        playlist.stop();
        await trigger.reply("Skipped.", { autoDelete: true });
    }
}

export default { command: Skip };