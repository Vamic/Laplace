import { Collection } from "discord.js";
import { BotCommand } from "./bot-command";

declare module "discord.js" {
    export interface Client {
        commands?: Collection<string, BotCommand>
        storage?: CommandStorage
    }
}

export interface CommandStorage { }
