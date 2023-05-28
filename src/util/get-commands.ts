import { Awaitable, Client } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { BotCommand, BotCommandExport } from '../types/bot-command';

export function getCommands(): { commands: BotCommand[], inits: Array<(client: Client) => Awaitable<void>> } {
    const commands: BotCommand[] = [];
    const inits: Array<(client: Client) => Awaitable<void>> = [];

    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const { command, init }: BotCommandExport = require(filePath).default;

            if (command) {
                if ('command' in command && 'execute' in command) {
                    commands.push(command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "command" or "execute" property.`);
                }
            }

            if (init) {
                inits.push(init);
            }
        }
    }

    return { commands, inits };
}