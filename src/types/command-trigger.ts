import { Interaction, Message, MessagePayload, MessagePayloadOption } from "discord.js";

class CommandTrigger {
    public action: Interaction | Message;

    constructor(action: Interaction | Message) {
        this.action = action;
    }

    public reply = async (options: string | MessagePayloadOption, extra?: MessagePayloadOption) => {
        const message = MessagePayload.create(this.action, options, extra);
        if (this.action instanceof Message) {
            return await this.action.reply(message);
        }
        if (this.action.isRepliable()) {
            return await this.action.reply(message);
        }
    };

    public followUpOrReply = async (options: string | MessagePayloadOption, extra?: MessagePayloadOption) => {
        const message = MessagePayload.create(this.action, options, extra);
        if ('followUp' in this.action && (this.action.replied || this.action.deferred)) {
            return await this.action.followUp(message);
        }
        return await this.reply(options, extra);
    };
}

export default CommandTrigger;