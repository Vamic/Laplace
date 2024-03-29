import { Client } from "discord.js";
import { log } from "../../../util/log";
import DiscordPlaylist from "./discord-playlist";

export const getPlaylist = (guildId: string, client: Client): DiscordPlaylist | undefined => {
    const { playlists } = client.storage!.dj!;
    return playlists[guildId];
}

export const initializeOrGetPlaylist = (client: Client<true>, guildId: string) => {
    const { services, fallBackService, playlists } = client.storage!.dj!;

    if (!playlists[guildId]) {
        playlists[guildId] = new DiscordPlaylist(client, guildId, { services: Object.values(services), fallBackService, logger: log })
    }

    return playlists[guildId];
}