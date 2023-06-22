import { Interaction, InteractionResponse, Message, MessagePayload, MessagePayloadOption } from "discord.js";
import { defaultDeleteAfter } from "../util";

export interface ExtraReplyOptions {
    autoDelete?: true | number;
    deleteUserMessage?: true;
}

function deleteAfter(target: Message | InteractionResponse, timeout?: true | number) {
    if (timeout === true) {
        timeout = defaultDeleteAfter;
    }
    if (!timeout || timeout < 0) return;
    setTimeout(async () => {
        try {
            await target.delete();
        } catch { }
    }, timeout as number);
}

export class CommandTrigger {
    public action: Interaction | Message;

    constructor(action: Interaction | Message) {
        this.action = action;
    }

    public reply = async (options: string | MessagePayloadOption, extra?: MessagePayloadOption & ExtraReplyOptions) => {
        const message = MessagePayload.create(this.action, options, extra);

        let res: Message | InteractionResponse | void = undefined;
        if (this.action instanceof Message) {
            res = await this.action.reply(message);
        }
        else if (this.action.isRepliable()) {
            res = await this.action.reply(message);
        }

        if (res) {
            deleteAfter(res, extra?.autoDelete);
        }

        if (extra?.deleteUserMessage && this.action instanceof Message && this.action.deletable) {
            await this.action.delete();
        }

        return res;
    };

    public followUpOrReply = async (options: string | MessagePayloadOption, extra?: MessagePayloadOption & ExtraReplyOptions) => {
        const message = MessagePayload.create(this.action, options, extra);
        if ('followUp' in this.action && (this.action.replied || this.action.deferred)) {
            const res = await this.action.followUp(message);
            deleteAfter(res, extra?.autoDelete);
            return res;
        }
        return await this.reply(options, extra);
    };
}