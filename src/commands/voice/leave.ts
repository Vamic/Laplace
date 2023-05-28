import { getVoiceConnection } from '@discordjs/voice';
import { Message, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';

const Leave: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Make me leave my current voice channel'),

    canExecute: ({ action: { guildId } }) => !!guildId,

    execute: async (trigger) => {
        const { action } = trigger;
        getVoiceConnection(action.guildId!)?.destroy();

        if (!(action instanceof Message)) {
            await trigger.followUpOrReply({ content: "👍", ephemeral: true });
        }
    }
}

export default { command: Leave };