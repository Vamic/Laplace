import { Client, Collection, Events, GatewayIntentBits, Message } from 'discord.js';
import { token } from './config.json';
import { BotCommand } from './types/bot-command';
import CommandTrigger from './types/command-trigger';
import { getCommands } from './util/get-commands';
import { log } from './util/log';

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.storage = {};

const { commands, inits } = getCommands();

for (const command of commands) {
    client.commands.set(command.command.name, command);
}

client.once(Events.ClientReady, async ({ user }) => {
    log(`Ready! Logged in as ${user.tag}, running ${inits.length} initializations `);
    for (const init of inits) {
        await init(client);
    }
});

client.on(Events.MessageCreate, async message => {
    const command = extractCommand(message);

    if (!command) {
        return;
    }

    const botCommand = client.commands?.get(command);

    if (!botCommand) {
        log(`Unhandled command '${command}' triggered by ${message.content}`);
        return;
    }

    log(`'${command}' triggered by ${message.content}`);

    await triggerCommand(new CommandTrigger(message), botCommand);
});

function extractCommand(message: Message) {
    if (message.content.startsWith('!')) {
        return message.content.split(' ')[0].substring(1);
    }
    if (message.content.split(' ')[0].startsWith('laplace')) {
        return message.content.split(' ')[0].substring('laplace'.length);
    }
    if (!!message.mentions.users.find(x => x.id == client.user?.id) || message.mentions.repliedUser?.id == client.user?.id) {
        return message.content.split(' ')[0];
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const botCommand = client.commands?.get(interaction.commandName);

    if (!botCommand) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    await triggerCommand(new CommandTrigger(interaction), botCommand);
});

async function triggerCommand(trigger: CommandTrigger, botCommand: BotCommand) {
    if (!botCommand.canExecute(trigger)) {
        console.error(`Matched command ${botCommand.command.name} but it can't execute this interaction.`);
        return;
    }

    try {
        log(`Command '${botCommand.command.name}' triggered`);
        await botCommand.execute(trigger);
    } catch (error) {
        console.error(error);
        await trigger.followUpOrReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

client.login(token);