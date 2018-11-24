const Command = require('../../src/bot/command/CommandPlus');
const StreamManager = require('./StreamManager');
const QueueManager = require('./QueueManager');
const PlayManager = require('./PlayManager');
const Youtube = require(`../../api/Youtube`);
const Util = require('../../src/util/Util');
const { MSG_BAD_WORDS } = require('../../src/util/Constants');
const { RichEmbed, StreamDispatcher, Message, GuildMember } = require('discord.js');


/**
 * Play command that plays audio from youtube in a voice channel
 * @extends {Command}
 */
class Play extends Command {
    constructor(bot, options) {
        const cmdName = 'play';

        super(bot, {
            name: cmdName,
            cooldownTime: 3,
            minArgs: 0,
            hasMultipleArgs: false,
            usage: `!${cmdName} [ <search query> | <video url> ] [options]\n\n`
                + `Use !${cmdName} by itself to play shit from your personal playlist or skip songs or resume playing\n\n`
                + `Options Short / Long\n`
                + `\t-r -repeat     : Plays your troll audio in an endless loop\n`
                + `\t-s -stop       : Stops troll audio currently playing\n`
                + `\t-d -display    : Displays a list of stuff in your personal playlist\n`
                + `\t-a -displayall : Displays a list of stuff in everyone's playlist\n`
                + `Example:\n`
                + `\t!${cmdName} sunday school\n`
                + `\t!${cmdName} https://youtu.be/oLLHF7_1za8\n`
                + `\t!${cmdName} 420 macintosh -r`
                + `\t\t!${cmdName} 420 macintosh -repeat\n`
                + `\t!${cmdName} -s\n`
                + `\t!${cmdName}`,
            description: 'Plays audio from YouTube based on your search query'
        });

        this.options = options;
        this.player = bot.player;
        this.explicitPlay = false;

        this.youtube = new Youtube(process.env.YOUTUBE_KEY, bot);
        this.streamManager = new StreamManager(this); 
        this.queueManager = new QueueManager(this);
        this.playManager = new PlayManager(this);
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

    //{ argInfo: { {String} cmd, {Array<String>} argv, {Number} argc, {Message} message, {TextChannel} channel }, promise: { resolve, reject }, channel, message }
    run(argInfo, promise) {
        this.bot.send({ message: Util.repeatStr('·', 30), to: argInfo.message.channel })
            .then(botMessage => {
                if (argInfo.argc === 0) {
                    this.processNoArgs(argInfo, promise, botMessage);
                    promise.resolve();
                } else if (argInfo.argv[0].startsWith('-')) {
                    this.processSingleArg(argInfo, promise, botMessage);
                    promise.resolve();
                } else {
                    this.processQuery(argInfo, promise, botMessage);
                }
            });

            // this.playManager.once('success', promise.resolve)
            //     .once('error', promise.reject);
    }

    processQuery({ cmd, argv, argc, message:memberMessage }, { resolve, reject }, botMessage) {
        // maybe create a util function to escape certain characters like '
        const repeat = argv.includes('-r') || argv.includes('-repeat');

        this.youtube.search(argv[0], `snippet,statistics,contentDetails` )
            .then(videoInfo => {
                const streamInfo = { id: memberMessage.author.id, videoInfo, repeat, botMessage, playCount: 0, time: 0, dispatcher: null };

                if (!videoInfo) {
                    botMessage.edit(`I culdn't find ${argv[0]} ¯\\_(ツ)_/¯`);
                } else if (this.player.isPlaying) {
                    this.queueManager.enqueue(streamInfo);
                } else {
                    this.playManager.play(streamInfo);
                }
            })
            .then(resolve)
            .catch(err => {
                botMessage.delete();
                reject(err);
            });
    }

    processNoArgs({ cmd, argv, argc, message:memberMessage }, { resolve, reject }, botMessage) {
        if (this.queueManager.size > 0) { // play through the instigator's queue now or play through the other queues
            const queue = this.queueManager.pop(memberMessage.author.id, true);

            this.playManager.stop(`Stopping and playing next audio in queue`)
                .then(() => {
                    this.playManager.play(Object.assign( {}, queue, { botMessage } ))
                        .then(resolve) 
                        .catch(reject)
                }) 
        } else {
            botMessage.edit(`*The playlist is empty*`)
                .then(resolve) 
                .catch(reject)
        }
    }

    processSingleArg({ cmd, argv, argc, message:memberMessage }, { resolve, reject }, botMessage) {
        const stop = argv.includes('-s') || argv.includes('-stop');
        const display = argv.includes('-d') || argv.includes('-display');
        const displayAll = argv.includes('-a') || argv.includes('-displayall');
        
        if (stop) {
            this.playManager.stop(`Stopped by member`)
                .then(streamInfo => botMessage.edit(`Stopped ur troll audio. Use \`!${this.name}\` by itself to resume playing from the playlist`).then(resolve))
                .catch(reject);
        } else if (display || displayAll) {
            botMessage.edit(`${this.queueManager.size > 0 ? this.queueManager.getQueueList(displayAll ? null : memberMessage.author.id) : `nein`}`,
                { code: 'http' }
            );
        } else {
            botMessage.edit(`*Invalid use of options. gg wp xD cX xD*\n\n*Use !help ${this.name} to display usage*`)
                .then(resolve) 
                .catch(reject);
        }
    }

}

module.exports = Play;