import { AudioResource } from '@discordjs/voice';
import { APIEmbedField, AttachmentBuilder, Awaitable, EmbedBuilder, GuildMember } from 'discord.js';
import { Song } from 'vdj';
import { error } from '../../../util/log';
import { TimeUnit } from '../../../util/number-extensions';

declare module "vdj" {
    export interface Song {
        extendedInfo?: {
            addedBy: GuildMember
        },
        audioResource?: AudioResource,
        display?: {
            embed: EmbedBuilder,
            thumbnail?: AttachmentBuilder;
        }
        initiateSongInfo: (requiresFull: boolean | undefined) => Awaitable<Song>
    }
}

function getPlaytime(song: Song): string {
    const currentTime = song.audioResource ? song.audioResource.playbackDuration : 0;
    const playtime = currentTime.toMSS(TimeUnit.Milliseconds);
    return song.info?.duration && song.info?.duration > 0
        ? playtime + "/" + song.info.duration.toMSS(TimeUnit.Seconds)
        : playtime;
}

function setSongDisplay(song: Song) {
    const info = song.info;
    var embed = new EmbedBuilder();
    song.display = {
        embed
    };

    if (!info) {
        return;
    }

    let icon: string | undefined;
    let serviceName: string | undefined;
    if (info.url?.indexOf("youtu")) {
        embed.setColor([150, 50, 50]);
        serviceName = "Youtube";
        icon = "https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-256.png";
    }
    if (info.metadataType === "soundcloud") {
        embed.setColor([150, 80, 0]);
        serviceName = "Soundcloud";
        icon = "https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_soundCloud-128.png";
    }

    const fields: Array<APIEmbedField> = [];

    if (serviceName && icon) {
        embed.setAuthor({ name: serviceName + (song.live ? " [LIVE]" : ""), iconURL: icon });
    } else if (info.metadataType === "ID3") {
        embed.setColor([75, 75, 75]);
        embed.setAuthor({ name: "Direct" });
        var title = info.title || info.url.split("/").slice(-1)[0];
        embed.setTitle(title);
        if (info.artist && info.artist.length) {
            let firstArtist = info.artist.shift()!;
            if (info.artist.length) firstArtist += "ft. " + info.artist.join(" and ");
            fields.push({ name: "Artist", value: firstArtist, inline: true });
        }
        if (info.album) {
            var albumtext = info.album;
            if (info.albumartist && info.albumartist.length) albumtext += " ft. " + info.albumartist.join(", ");
            if (info.date instanceof Date) albumtext += " (" + info.date.getFullYear() + ")";
            fields.push({ name: "Album", value: albumtext, inline: true });
            if (info.track && info.track.no) {
                var tracktext = info.track.no + "/" + info.track.of;
                if (info.disk && info.disk.no) {
                    var disktext = info.disk.no + "/" + info.disk.of;
                    tracktext += " on Disk " + disktext;
                }
                fields.push({ name: "Track", value: tracktext, inline: true });
            }
        }
    }
    if (info.genre && info.genre.filter(Boolean).length) {
        fields.push({ name: "Genre", value: info.genre.join(", "), inline: true });
    }
    if (info.imgURL) {
        embed.setThumbnail(info.imgURL);
    } else if (info.img && info.imgFormat) {
        const thumbnail = new AttachmentBuilder(info.img).setName("thumb." + info.imgFormat);
        embed.setThumbnail("attachment://" + thumbnail.name);
        song.display.thumbnail = thumbnail;
    }

    embed.addFields(fields);
}


Song.prototype.initiateSongInfo = async function (requiresFull = true) {
    if (!this) return this;

    if (!this.display || !this.display.embed || (!this.info?.full && requiresFull)) {
        try {
            if (!this.info?.title || (!this.info?.full && requiresFull)) {
                await this.getSongInfo();
            }
            setSongDisplay(this);
        } catch (err) {
            if (err instanceof Error && err.message.indexOf("not id3v2") == -1) error(err.message);
            this.info = {
                full: false,
                metadataType: "unknown",
                url: this.URL,
                title: this.streamURL
            };
            this.display = { embed: new EmbedBuilder().setAuthor({ name: this.live ? "Livestream" : "Unknown" }).setTitle(this.info.title!) };
        }
    }

    const playtime = getPlaytime(this);

    const addedBy = this.extendedInfo?.addedBy.displayName ?? "someone";
    let description = `${playtime} added by ${addedBy}\n${this.info?.url}`;

    this.display?.embed.setDescription(description);

    return this;
}