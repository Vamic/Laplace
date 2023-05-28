import { Message } from "discord.js";
import CommandTrigger from "./command-trigger";

export function isRepliable({ action: trigger }: CommandTrigger) { return trigger instanceof Message || trigger.isRepliable() }
