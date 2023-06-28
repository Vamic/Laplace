import { Client, Collection, Events, GatewayIntentBits, Message } from 'discord.js';
import { token } from './config.json';
import { BotCommand } from './types/bot-command';
import { CommandTrigger } from './types/command-trigger';
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
    log(`Initialization finished!`);
});

client.on(Events.MessageCreate, async message => {
    const command = extractCommand(message);

    if (!client.commands) {
        return;
    }

    let matchedCommand: BotCommand | undefined;
    if (command) {
        for (const [name, botCommand] of client.commands.filter(x => !x.matchOnCanExecute)) {
            if (botCommand.matchOnCanExecute) continue;
            if (command != name) continue;
            matchedCommand = botCommand;
        }
    }


    if (!matchedCommand) {
        for (const [_, botCommand] of client.commands.filter(x => x.matchOnCanExecute)) {
            if (botCommand.canExecute(new CommandTrigger(message))) {
                matchedCommand = botCommand;
                break;
            }
        }
    }

    if (!matchedCommand) {
        if (command) {
            log(`Unhandled command '${command}' triggered by ${message.content}`);
        }
        return;
    }

    log(`'${matchedCommand.command.name}' triggered by ${message.content}`);

    try {
        await triggerCommand(new CommandTrigger(message), matchedCommand);
    } catch (error) {
        console.error(error);
        await message.reply({ content: 'There was an error while executing this command!' });
    }
});

function extractCommand(message: Message) {
    if (message.content.startsWith('!')) {
        return message.content.split(' ')[0]!.substring(1);
    }
    if (message.content.split(' ')[0]!.startsWith('laplace')) {
        return message.content.split(' ')[0]!.substring('laplace'.length);
    }
    if (!!message.mentions.users.find(x => x.id == client.user?.id) || message.mentions.repliedUser?.id == client.user?.id) {
        return message.content.split(' ')[0];
    }
    return;
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