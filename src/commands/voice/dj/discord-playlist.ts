import { getVoiceConnection, AudioPlayer, joinVoiceChannel, AudioPlayerStatus, NoSubscriberBehavior, AudioResource, createAudioResource } from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import EventEmitter from 'events';
import { Playlist, PlaylistSettings } from 'vdj';

export default class DiscordPlaylist extends Playlist {
    private guildId: string;
    private player: AudioPlayer;
    private events: EventEmitter;

    constructor(guildId: string, options: PlaylistSettings) {
        super(options);
        this.guildId = guildId;
        this.events = new EventEmitter();
        this.player = new AudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });
        this.setupAudioPlayerEvents();
    }

    private setupAudioPlayerEvents() {
        this.player.on(AudioPlayerStatus.Idle, async () => {
            this.events.emit('ended');

            if (!getVoiceConnection(this.guildId)) {
                return;
            }

            if (this.player.checkPlayable()) {
                return;
            }

            const next = await this.next();
            if (!next) return this._destroy();

            await this._start();
        });
    }

    public ensureVoiceConnection(channel: VoiceBasedChannel): void {
        if (!channel) throw new Error("No channel provided");

        let connection = getVoiceConnection(channel.guildId);
        if (connection) {
            this.guildId = channel.guildId;
            return;
        }

        if (!channel.joinable) throw new Error("Missing permissions to join in channel.");

        connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        this.guildId = channel.guildId;
    }

    public async start(channel: VoiceBasedChannel) {
        this.ensureVoiceConnection(channel);

        if (this.player.state.status !== AudioPlayerStatus.Playing) {
            await this._start();
        }
    }

    public async skip() {
        super.next();
        await this._start();
    }

    public stop() {
        this.player.stop(true);
    }

    public destroy() {
        this._destroy();
    }

    public pause() {
        this.player.pause();
        this.events.emit('pause');
    }

    public resume() {
        this.player.unpause();
        this.events.emit('resume');
    }

    private async _start() {
        this.stop();

        const connection = getVoiceConnection(this.guildId);

        if (!this.current) {
            this.events.emit('error', new Error("No current song."));
            return;
        }

        const stream = await this.current.stream();

        if (!stream) {
            return;
        }

        if (!connection) {
            this.events.emit('error', new Error("No voice connection."));
            return;
        }

        this.current.audioResource = createAudioResource(stream, {});
        this.player.play(this.current.audioResource);

        connection.subscribe(this.player);
        this.events.emit('playing');
    }

    private _destroy() {
        getVoiceConnection(this.guildId)?.destroy();
        this.clear();
        this.events.emit('destroyed');
    }
}