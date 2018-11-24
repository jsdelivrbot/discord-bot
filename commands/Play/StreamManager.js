const Youtube = require(`${process.env.PWD}/api/Youtube`);
const { EventEmitter } = require('events');
const { Readable } = require('stream');
const { StreamDispatcher } = require('discord.js');
const now = require('performance-now');

class StreamManager extends EventEmitter {
    constructor(play) {
        super(); // maybe dont extend event and let player handle that

        this.bot = play.bot;
        this.player = play.bot.player;
        this.options = play.options;

        this._explicitStop = false;
        this._timeoutId = 0;
        this._attempts = 0;
    }

    /**
     * @typedef {Object} VideoInfo
     * @property {String} url the url of the video
     * @property {String} title the name of the video
     * @property {String} description the description of the video
     * @property {String} thumbnail the url to the video thumbnail image
     * @property {String} publishedAt the creation date and time of the video in ISO 8601 format
     * @property {Object} statistics the views, likes, dislikes and comment count the video has
     * @property {String} duration the time length of the video in ISO 8601 format
     * @property {Array<String>} tags a list of keyword tags associated with the video
     * @property {String} channelTitle the name of the channel that published the video
     * @property {String} channelUrl the url to the channel that published the video
     */

    /**
     * @typedef {Object} StreamInfo the information about the stream
     * @property {VideoInfo} videoInfo the information about the video to be streamed
     * @property {Boolean} repeat whether or not the stream should repeat playing
     * @property {StreamDispatcher} dispatcher the dispatcher that controls this stream
     * @property {Number} time the initial time the stream has began streaming in milliseconds
     * @property {Number} playCount the number of times this stream has been played
     * @property {Message} botMessage the message the bot sent to chat to indicate the status of the stream
     */

    /**
     * Deploys the stream to the voice channel
     * @param {Object} info all the info needed to deploy a stream
     * @param {Readable} info.stream the readable stream to be deployed
     * @param {StreamInfo} info.streamInfo information about the readable stream to be deployed
     * @param {Number} [info.passes] the number of passes the dispatcher should take when sending packets
     * @param {Number} [info.volume] the overall volume of the stream
     * @return {Promise<StreamInfo>} the information about the stream that was deployed
     */
    deployStream({ stream, streamInfo, passes, volume }) {
        if (!(stream instanceof Readable)) {
            throw new TypeError('A valid Readable stream is required');
        }
        const time = now();

        return this.player.play({ stream, passes, volume })
            .then(dispatcher => {
                const info = Object.assign( {}, streamInfo, { dispatcher, time } );
                
                this._handleStream(info);
                return info;
            });
    }

    /**
     * Destroys the deployed stream and halts all play activity
     * @param {String} [reason] the reason for destroying this stream
     * @return {Promise<StreamInfo>} the information about the stream that was destroyed
     */
    destroyStream(reason = 'no reason specified') {
        this._explicitStop = true;

        return new Promise((resolve, reject) => {
            this.player.stop(reason)
                .then(resolve)
                .catch(reject);
        });
    }

    _reset() {

        // this.bot.clearTimeout(this._timeoutId);
        this._attempts = 0;
        this._explicitStop = false;
           
    }

    /**
     * Removes any active listeners created here to prevent memory leaks
     * @param {StreamInfo} streamInfo stream information containing the dispatcher to be cleaned
     */
    _cleanup(streamInfo) {
        const streamEventListener = this.bot.listeners('streamEvent')[0];
        const dispatchListeners = { // this may not be necessary, all you have to do is remove start
            'start': streamInfo.dispatcher.listeners('start')[0], 
            'end': streamInfo.dispatcher.listeners('end')[0],
            'debug': streamInfo.dispatcher.listeners('debug')[0],
            'error': streamInfo.dispatcher.listeners('error')[0]
        }
        if (streamEventListener) {
            this.bot.removeListener('streamEvent', streamEventListener);
        }
        for (const listenerName in dispatchListeners) {
            if (dispatchListeners[listenerName]) {
                streamInfo.dispatcher.removeListener(listenerName, dispatchListeners[listenerName]);
            }
        }
    }

    /**
     * Helper function that reattempts a stream deploy should it fail
     * @param {StreamInfo} streamInfo information about the stream to be redeployed
     */
    _reattemptDeploy(streamInfo) {
        // remove listeners to prevent memory leaks
        this._cleanup(streamInfo);

        // do some reattempts before quitting
        if (++this._attempts > this.options.playStreamAttempts) {
            streamInfo.botMessage.edit(`ugh your troll audio took too long to load. gg try again?`);
            this._handleCaughtError(new Error('Stream timed out'), streamInfo);
        } else {
            streamInfo.botMessage.edit(`Making another attempt at playing your shit\nAttempts made: *${this._attempts}*`);
            this.destroyStream(`making another attempt, attempts made: ${this._attempts}`)
                .then(() => {
                    this.deployStream({
                        stream: Youtube.createStream(streamInfo.videoInfo.url),
                        streamInfo
                    });
                });
        }
    }

    /**
     * streamPlayer main event handler after a StreamDispatcher is created
     * @param {StreamInfo} streamInfo the information about the stream
     */
    _handleStream(streamInfo) {
        // grab information about the stream using Readable or voiceconnection

        this._timeoutId = this.bot.setTimeout(
            () => this.bot.log(`timeout would be triggered now`), 
            this.options.playStreamLoadingTimeout * 1000
        );
        this.bot.once('streamEvent', event => this._handleCaughtError(event, streamInfo));
       
        streamInfo.dispatcher.once('start', () => {
            this.bot.clearTimeout(this._timeoutId);
            this._handleStart(streamInfo);      
        })
            .once('end', reason => {
                this._handleEnd(streamInfo, reason);
            })
            .once('debug', debug => this.bot.log(`dispatcher debug: ${debug}`))
            .once('error', error => this._handleCaughtError(error, streamInfo));
    }

    /** 
     * streamPlayer start event handler
     * 
     */
    _handleStart(streamInfo) {
        this.bot.log(`Play: ${streamInfo.videoInfo.title} --- ${((now() - streamInfo.time) / 1000).toFixed(2)}s`);
        try {
            this.emit('play', streamInfo);
        } catch (error) {
            this._handleCaughtError(error, streamInfo);
        } finally {
            this._reset();
        }
    }

    /** 
	 * 
	 */
    _handleEnd(streamInfo, reason) {
        // emit a next event if stop command isnt used
        // emit stop if stop command is used
        this._cleanup(streamInfo);
        this.bot.log(`Stop: ${streamInfo.videoInfo.title}\nReason: ${reason && reason.replace('Stream is not generating quickly enough.', 'End of stream') || 'No reason'}`);
        
        try {
            this.emit(this._explicitStop ? 'stop' : 'next', streamInfo);
        } catch (error) {
            this._handleCaughtError(error, streamInfo);
        }
    }

    /**
     * Used to handle errors that occur
     * @param {Error} error
     * @param {StreamInfo} streamInfo 
     */
    _handleCaughtError(error, streamInfo) {
        if (error instanceof Error && error.message.includes('ECONNRESET')) {
            this.bot.log(`ECONNRESET, attempting redeployment\nreadableFlowing: ${streamInfo.dispatcher.stream.readableFlowing}`);
            this._reattemptDeploy(streamInfo);
        } else {
            this.destroyStream(`Stopped due to ${error instanceof Error ? `${error.name}: ${error.message}` : error}`);
            this._cleanup(streamInfo);
            this._reset();
            this.bot.log(`StreamManager -- ${error instanceof Error ? `${error.name}: ${error.message}` : error}`)

            if ( !this.emit('error', error, streamInfo) ) {
                this.bot.log(`**Warning**: No error event handlers exist to handle caught exceptions`);
                throw error;
            }
        }
    }
}

module.exports = StreamManager;