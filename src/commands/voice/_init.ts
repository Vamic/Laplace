import { Client } from "discord.js";
import { IService, YoutubedlService, YouTubeService } from "vdj"
import { keys } from '../../config.json';
import { log } from "../../util/log";
import DiscordPlaylist from "./dj/discord-playlist";

declare module "../../types/bot-client" {
    export interface CommandStorage {
        dj?: {
            playlists: { [guildId: string]: DiscordPlaylist }
            services: { [key: string]: IService }
            fallBackService?: IService
        }
    }
}

const init = (client: Client) => {
    client.storage!.dj = { services: {}, playlists: {} };

    if (keys) {
        if (keys.google) {
            const ytService = new YouTubeService(keys.google);
            client.storage!.dj.services[ytService.type] = ytService;
        } else {
            log("No Google API key, will use DirectService for Youtube videos");
        }
    } else {
        log("No API keys, will use DirectService for all songs");
    }
    client.storage!.dj.fallBackService = new YoutubedlService();
}

export default { init };