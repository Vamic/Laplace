import { Awaitable, Client, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import CommandTrigger from "./command-trigger";

export interface BotCommandExport {
    command?: BotCommand
    init?: (client: Client) => Awaitable<void>
}

export interface BotCommand {
    command: { name: string, toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody },
    canExecute: (trigger: CommandTrigger) => boolean,
    execute: (interaction: CommandTrigger) => Awaitable<void>
}