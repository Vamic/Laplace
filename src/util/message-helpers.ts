import { Message } from "discord.js";

export function extractCommand(message: Message): string | undefined {
    if (message.content.startsWith('!')) {
        return message.content.split(/ |:/)[0]!.substring(1);
    }
    if (message.content.toLowerCase().startsWith('laplace ')) {
        return message.content.substring('laplace '.length).split(/ |:/)[0];
    }
    if (!!message.mentions.users.find(x => x.id == message.client.user?.id) || message.mentions.repliedUser?.id == message.client.user?.id) {
        return message.content.split(/ |:/)[0];
    }
    return;
}

export function extractContent(message: Message): string {
    if (message.content.startsWith('!')) {
        return message.content.split(' ').slice(1).join(' ');
    }
    if (message.content.toLowerCase().startsWith('laplace ')) {
        return message.content.substring('laplace '.length).split(' ').slice(1).join(' ');
    }

    return message.content.split(' ').slice(1).join(' ');
}

export function extractOptions(message: Message): Array<string> {
    var commandWithOptions = "";

    if (message.content.toLowerCase().startsWith('laplace ')) {
        commandWithOptions = message.content.substring('laplace '.length).split(' ')[0]!;
    }
    else {
        commandWithOptions = message.content.split(' ')[0]!;
    }

    return ~commandWithOptions.indexOf(':') ? commandWithOptions.split(':').slice(1) : [];
}