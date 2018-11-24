const { EventEmitter } = require('events');
const { Client, VoiceChannel } = require('discord.js');
const { Readable } = require('stream');
const now = require('performance-now');
const StreamManager = require('./StreamManager');

class Player extends EventEmitter {
    constructor(bot) {
        super();

        if ( !(bot instanceof Client) ) {
            throw new Error(`A valid client instance is required`);
        }
        this.bot = bot;

        //this.on('stop', this._handleStop); ... emitted when StreamDispatcher fires end event
        //this.on('play', this._handlePlay); ... emitted when StreamDispatcher fires start event
    }

    // if player is playing any audio
    get isPlaying() {
        return this.streamDispatcher ? true : false;
    }

    get streamDispatcher() {
        return this.bot.voiceConnections.size > 0 ? this.bot.voiceConnections.first().dispatcher : null;
    }

    /**
    * Plays an audio stream to either the currently connected voice channel or the default voice channel
    * @param {Object} streamInfo an object containing information about the audio stream
    * @param {StreamReadable} streamInfo.stream an audio stream to play
    * @param {String|VoiceChannel} [streamInfo.to=currentVoiceConnection.channel|bot.defaultVoiceChannel]
    *   the voice channel to deploy the audio stream to.
    *   If no channel is provided, either the currently connected channel or default channel will be used
    * @return 
    */
    play({ stream, to:channel, passes = 3, volume = 0.5 } = {}) {
        const timer = now();
        const playStream = voiceConnection => voiceConnection.playStream(stream, {volume, passes}) // set these in config please
        
        const currentVoiceConnection = this.bot.voiceConnections.first();
        const queryChannel = channel ? channel
            : currentVoiceConnection ? currentVoiceConnection.channel
            : this.bot.defaultVoiceChannel;
        channel = this.bot.findChannel(queryChannel);

        return new Promise((resolve, reject) => {
            if ( !(channel instanceof VoiceChannel) ) {
                reject(new TypeError(`A valid resolvable voice channel is required`));
            } else if (currentVoiceConnection && currentVoiceConnection.channel.name === channel.name) { 
                resolve(playStream(currentVoiceConnection)); // resolve promise with voiceHandler (dispatcher)
            } else {
                this.bot.joinVoiceChannel(channel) // returns an insatnce of VoiceConnection
                    .then(playStream) // returns an instance of VoiceHandler
                    .catch(reject)
                    .then(resolve); // resolve promise with voiceHandler (dispatcher)
            }
        });
    }

    stop(reason) {
        const dispatcher = this.streamDispatcher;

        return new Promise((resolve, reject) => {
            if (dispatcher) { // if something is playing
                dispatcher.end(reason);
                resolve('Successfully stopped');
            } else {
                resolve('Nothing is playing');
            }
        })
        
    }
}

module.exports = Player;