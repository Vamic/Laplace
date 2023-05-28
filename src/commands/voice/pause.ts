import { Message, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';
import { getPlaylist } from './dj/util';

const Pause: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing track'),

    canExecute: ({ action: trigger }) => !!trigger.guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        const playlist = getPlaylist(action.guildId!!, action.client);

        if (!playlist) {
            await trigger.followUpOrReply({ content: "Nothing to pause.", ephemeral: true });
            return;
        }

        playlist.pause();
        await trigger.reply("Paused.");
    }
}

export default { command: Pause };