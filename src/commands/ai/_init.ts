import { Client } from "discord.js";
import { keys } from '../../config.json';
import { log } from "../../util/log";
import OpenAI from "openai";


declare module "../../types/bot-client" {
    export interface CommandStorage {
        ai?: {
            openai: OpenAI,
        }
    }
}

const init = async (client: Client) => {
    if (keys?.openai) {
        const openai = new OpenAI({
            apiKey: keys.openai,
        });
        client.storage!.ai = { openai };

    } else {
        log("No OpenAI key, can't initialize openai commands");
    }
}

export default { init };