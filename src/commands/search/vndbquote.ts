import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { BotCommand, isRepliable } from '../../types';
import VNDB from 'vndb-api';

// Create a client
const vndb = new VNDB('Laplace', { minConnection: 0 });

const VndbQuote: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('vndbquote')
        .setDescription('Gets a random quote from VNDB'),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const result = await vndb.query(`get quote basic (id>=1) {"results":1}`);
        const quote = result.items[0];
        const formatted = `_"${quote.quote}"_\n[${quote.title}](https://vndb.org/v${quote.id})`;
        await trigger.reply({ embeds: [new EmbedBuilder().setDescription(formatted)] });
    }
}

export default { command: VndbQuote };