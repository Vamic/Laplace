import { Collection, REST, Routes } from 'discord.js';
import { clientId, devServerId, token } from './config.json';
import { getCommands } from './util/get-commands';
import { BotCommand } from './types/bot-command';

var args = process.argv.slice(2);
if (args.shift() !== "manual-run-only") {
    throw "hey no";
}

const param = args.shift();

let endpoint;
if (param === "devServer") {
    endpoint = Routes.applicationGuildCommands(clientId, devServerId);
}
else if (param === "global") {
    endpoint = Routes.applicationCommands(clientId);
}
else {
    throw "stop it";
}

const deduplicated = new Collection<string, BotCommand>();

for (const command of getCommands().commands) {
    deduplicated.set(command.command.name, command);
}

const commands = deduplicated.filter(x => 'toJSON' in x.command).map(x => x.command.toJSON!());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands:`);
        console.log(commands.map(x => x.name).join(", "));

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            endpoint,
            { body: commands },
        );

        console.log(`Successfully reloaded ${(data as any[])?.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();