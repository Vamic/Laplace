import { Message } from "discord.js";

export function extractCommand(message: Message): string | undefined {
    if (message.content.startsWith('!')) {
        return message.content.split(' ')[0].substring(1);
    }
    if (message.content.split(' ')[0].startsWith('laplace')) {
        return message.content.split(' ')[0].substring('laplace'.length);
    }
    if (!!message.mentions.users.find(x => x.id == message.client.user?.id) || message.mentions.repliedUser?.id == message.client.user?.id) {
        return message.content.split(' ')[0];
    }
}

export function extractContent(message: Message): string {
    if (message.content.startsWith('!') || message.content.split(' ')[0].startsWith('laplace')) {
        return message.content.split(' ').slice(1).join(' ');
    }

    return message.content;
}