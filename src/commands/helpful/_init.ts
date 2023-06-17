import { Client } from "discord.js";
import { keys } from '../../config.json';
import { log } from "../../util/log";
import { v2 } from '@google-cloud/translate';
import { LanguageResult } from "@google-cloud/translate/build/src/v2";


declare module "../../types/bot-client" {
    export interface CommandStorage {
        translate?: {
            google: v2.Translate,
            languages: Array<LanguageResult>
        }
    }
}

const init = async (client: Client) => {
    if (keys?.google) {
        const google = new v2.Translate({ key: keys.google });
        const [languages] = await google.getLanguages();
        client.storage!.translate = { google, languages };

    } else {
        log("No Google key, can't initialize translate command");
    }
}

export default { init };