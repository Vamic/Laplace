import { Interaction, InteractionResponse, Message, MessagePayload, MessagePayloadOption } from "discord.js";
import { defaultDeleteAfter } from "../util";

export interface ExtraReplyOptions {
    autoDelete?: true | number;
}

function deleteAfter(timeout?: true | number) {
    if (timeout === true) {
        timeout = defaultDeleteAfter;
    }
    if (!timeout || timeout < 0) return () => { };
    return async (x: Message | InteractionResponse) => {
        setTimeout(async () => {
            try { x.delete(); } catch { }
        }, timeout as number);
    };
}

export class CommandTrigger {
    public action: Interaction | Message;

    constructor(action: Interaction | Message) {
        this.action = action;
    }

    public reply = async (options: string | MessagePayloadOption, extra?: MessagePayloadOption & ExtraReplyOptions) => {
        const message = MessagePayload.create(this.action, options, extra);
        if (this.action instanceof Message) {
            return await this.action.reply(message)
                .then(deleteAfter(extra?.autoDelete));
        }
        if (this.action.isRepliable()) {
            return await this.action.reply(message)
                .then(deleteAfter(extra?.autoDelete));
        }
        return;
    };

    public followUpOrReply = async (options: string | MessagePayloadOption, extra?: MessagePayloadOption & ExtraReplyOptions) => {
        const message = MessagePayload.create(this.action, options, extra);
        if ('followUp' in this.action && (this.action.replied || this.action.deferred)) {
            return await this.action.followUp(message)
                .then(deleteAfter(extra?.autoDelete));
        }
        return await this.reply(options, extra);
    };
}