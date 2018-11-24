const Youtube = require(`${process.env.PWD}/api/Youtube`);
const Util = require('../../src/util/Util');
const { RichEmbed, StreamDispatcher, Message, User } = require('discord.js');
const { EventEmitter } = require('events');

const DURATION_REG_EXP = /(?:\d+DT)|(?:\d+H|\d+M|\d+S)/g;
const FULL_UNITS = { DT: 'day', H: 'hour', M: 'minute', S: 'second'};

class PlayManager extends EventEmitter {
    constructor(play) {
        super();

        this.bot = play.bot;
        this.options = play.options;

        // i mean you could just include the managers in here
        this.streamManager = play.streamManager;
        this.queueManager = play.queueManager;

        this.streamManager.on('play', this._handlePlay.bind(this));
        this.streamManager.on('stop', this._handleStop.bind(this));
        this.streamManager.on('next', this._handleNext.bind(this));
        this.streamManager.on('error', this._handleError.bind(this));
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
     * @property {Snowflake} id the member id that this stream belongs to
     * @property {VideoInfo} videoInfo the information about the video to be streamed
     * @property {Boolean} repeat whether or not the stream should repeat playing
     * @property {Number} time the initial time the stream has began streaming in milliseconds
     * @property {Number} playCount the number of times this stream has been played
     * @property {Message} botMessage the message the bot sent to chat that indicates the status of the stream
     * @property {StreamDispatcher} dispatcher the dispatcher that controls this stream
     */

    get isPlaying() {
        return this.bot.player.isPlaying();
    }

    /**
     * Plays an audio stream to the specified voice channel
     * @param {StreamInfo} streamInfo the information about a youtube video to stream
     * @param {User} streamInfo.member the member this stream belongs to
     * @param {VideoInfo} streamInfo.videoInfo the information about the video to be streamed
     * @param {Boolean} [streamInfo.repeat=false] whether or not the stream should repeat playing
     * @param {Number} [streamInfo.time=0] the initial time the stream has began streaming in milliseconds
     * @param {Number} [streamInfo.playCount=0] the number of times this stream has been played
     * @param {Message} streamInfo.message the message the bot sent to chat to indicate the status of the stream
     * @return {Promise<StreamDispatcher>} the dispatcher that handles the stream
     */
    // dont return anything
    play({ id, videoInfo, repeat = false, time = 0, playCount = 0, botMessage, dispatcher = null } = {}) {
        return this.streamManager.deployStream({
            stream: Youtube.createStream(videoInfo.url),
            streamInfo: { id, videoInfo, repeat, time, playCount, botMessage, dispatcher },
            passes: this.options.playStreamPasses,
            volume: this.options.playStreamVolume
        });
    }

    stop(reason) {
        return this.bot.player.isPlaying ? this.streamManager.destroyStream(reason) 
            : new Promise(resolve => resolve());
    }

    /**
     * Internal handler for next event. Starts when a stream ends
     * @param {StreamInfo} streamInfo the information about the stream that just ended
     */
    _handleNext(streamInfo) {
        if (streamInfo.repeat) {
            this.play(streamInfo);
        } else if (this.queueManager.size > 0) { // for some reason this is always 1 when theres stuff in the queue
            // get the next audio stream from queuemanager
            const queue = this.queueManager.dequeue(streamInfo.id, true)

            this.bot.send({
                message: Util.repeatStr('.', 20),
                to: queue.botMessage.channel
            }).then(message => {
                queue.botMessage = message;
                this.play(queue);
            });
        } else {
            this._handleStop(streamInfo);
        }
    }

    /**
     * Internal handler for play event. Starts when stream starts speaking
     * @param {StreamInfo} streamInfo the information about the stream currently streaming
     */

     // TODO: throw this into play. emit a play event and send streamInfo
    _handlePlay(streamInfo) {
        if (++streamInfo.playCount > 1 && streamInfo.repeat) {
            this.bot.user.setPresence({ status: 'idle', game: { name: streamInfo.videoInfo.title, type: 'LISTENING' } });
            return; 
        }
        const formatNumString = number => parseInt(number, 10).toLocaleString(); // used for placing commas in numbers that are strings
        const { url, title, description, thumbnail, publishedAt, statistics, duration, tags, channelTitle } = streamInfo.videoInfo;
        const parsedDuration = duration.match(DURATION_REG_EXP) // a hack way of converting an ISO timestamp to english
            .map(elem => {
                // replace the DT, H, M, S with the units
                const time = elem.match(/\d+/)[0];
                const unit = elem.match(/\D+/)[0];
            
                return elem.replace(unit, ` *${FULL_UNITS[ unit ]}${time == 1 ? '' : 's'}*`);
            });
        const embed = new RichEmbed() // think about putting this in play.js and maybe the handlers in here too. might wanna let player.js take care of events
            .setColor(0xFF3333)
            .setTitle(`${title}`)
            .setURL(url)
            .setFooter(channelTitle, `http://i.imgur.com/GgbwF4s.png`)
            .setTimestamp(publishedAt)
            .setAuthor(`Now Playing`, `http://i.imgur.com/GgbwF4s.png`, url)
            .setDescription( Util.truncate(description, { maxLength: 50, endChar: ' ', append: '...' }) )
            .setImage(thumbnail)
            .addField(`Statistics`, // have to check if like and dislike counter is enabled
                `${ statistics.likeCount ? `${this._calculateAsshurtLevel(parseInt(statistics.likeCount), parseInt(statistics.dislikeCount))}% *asshurt*\n`
                    : '' }`
                + `${formatNumString(statistics.viewCount)} *views*`, true)
            .addField(`Duration`, parsedDuration, true)
 
        if (tags) { // tags can be undefined if there's no tags for the video
            embed.addField( `Tags`, Util.truncate(tags, { maxLength: 85, joinString: ', ', endChar: ',', append: '...' }) );
        }
        this.bot.user.setPresence({ status: 'idle', game: { name: title, type: 'LISTENING' } });
        streamInfo.botMessage.edit(embed)
        .then(message => {
            if (streamInfo.repeat && streamInfo.playCount === 1) {
                message.edit(`ＥＮＤＬＥＳＳ　ＲＥＰＥＡＴ　ホチの`);
            }
        });   
    }

    /**
     * Internal handler for play event. Emitted when stream stops speaking
     * @param {StreamInfo} streamInfo the information about the stream currently streaming
     */
     // TODO: throw this into play. emit a stop event and send streamInfo
    _handleStop(streamInfo) {
        this.bot.user.setPresence({ status: 'online', game: { name: 'viooz.ru', type: 'WATCHING' } });
    }
     // TODO: throw this into play. emit a error event and send streamInfo
    _handleError(error, streamInfo) {
        streamInfo.botMessage.delete(3000)
            .then(message => this.bot.send({ message: `gah something went terribly wrong. gg wp?`, to: message.channel }));
    }

        /**
     * Calculates the asshurt level percentage from likes and dislikes of entry
     * @param {Number} likes amount of likes the entry got
     * @param {Number} dislikes amount of dislikes the entry got
     * @return {Number} a number between 0 and 100, inclusive. the more the merrier
     */
    _calculateAsshurtLevel(likes, dislikes) {
        var total = likes + dislikes;
        
        if (total === 0) {
            total = 1;
        }
        return Math.round(((dislikes / total) * 100).toFixed(2));
    }
}

module.exports = PlayManager;