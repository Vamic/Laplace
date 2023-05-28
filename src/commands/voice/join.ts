import { joinVoiceChannel } from '@discordjs/voice';
import { GuildMember, Message, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../../types/bot-command';

const Join: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Make me join your current voice channel'),

    canExecute: ({ action: { member } }) => !!(member as GuildMember)?.voice?.channel,

    execute: async (trigger) => {
        const { action } = trigger;
        const voiceChannel = (action.member as GuildMember)?.voice?.channel;

        if (!voiceChannel) {
            await trigger.followUpOrReply({ content: "Couldn't find your voice channel", ephemeral: true });
            return;
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            guildId: voiceChannel.guildId
        });

        if (!(action instanceof Message)) {
            await trigger.followUpOrReply({ content: "👍", ephemeral: true });
        }        
    }
}

export default { command: Join };