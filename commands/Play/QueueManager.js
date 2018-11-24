const { Collection, GuildMember } = require('discord.js');

class QueueManager {
    constructor(play) {
        this.playCmd = play;
        this.bot = play.bot;
        /**
        * a collection of personal audio queues that correlates to members
        * @type {Collection<Snowflake, StreamQueue} 
        */
        this.collectionQueue = new Collection();
        /**
        * a collection of members that have been placed in the queue
        * @type {Collection<Snowflake, } 
        */
        this.collectionMemberHistory = new Collection();
    }

    /**
     * @typedef {Object} StreamQueue
     * @property {GuildMember} member the member that this stream belongs to
     * @property {Array<StreamInfo>} queue the member's queue that contains information about the queued streams
     */

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
     * @property {StreamDispatcher} dispatcher the dispatcher that controls this stream
     * @property {Number} time the initial time the stream has began streaming in milliseconds
     * @property {Number} playCount the number of times this stream has been played
     * @property {Message} botMessage the message the bot sent to chat to indicate the status of the stream
     */

    get size() {
        return this.collectionQueue.size;
    }
    
    hasMember(id) {
        if (id === undefined || id === null) {
            return false;
        } else {
            return this.collectionQueue.has(id);
        }
    }
     /**
     * Dequeues the next stream to be played from either the member's queue or general queue
     * @param {Snowflake} [id] the member id to search for in the collection queue
     * @param {Boolean} [useGeneralQueue=true] indicates if the general queue should be used if member param is provided but could not be found in the collection queue
     * @return {StreamInfo} either the member's next stream or the overall queue's next stream to be played. null if the general queue is empty
     */
    // maybe rename to getValue
    dequeue(id, useGeneralQueue = true/*, {useGeneralQueuee = true, method = 'dequeue'}*/) {
        var streamInfo;

        if (typeof id === 'boolean') {
            useGeneralQueue = id;
            id = undefined;
        }

        if (this.collectionQueue.size > 0) {
            const entry = this.hasMember(id) ? this.collectionQueue.get(id)
                : typeof id !== 'undefined' && useGeneralQueue ? this.collectionQueue.first()
                : null;
            
            if (!entry) {
                streamInfo = null;
            } else {
                streamInfo = entry.queue.shift();

                if (entry.queue.length === 0) { // get rid of member from collection if queue is empty
                    this.collectionQueue.delete(streamInfo.id);
                }
            }
        } else {
            streamInfo = null;
        }
        return streamInfo;
    }

    /**
     * Pops the last stream added to be played from either the member's queue or general queue. 
     * @param {Snowflake} [id] the member id to search for in the collection queue
     * @param {Boolean} [useGeneralQueue=true] indicates if the general queue should be used if member param is provided but could not be found in the collection queue
     * @return {StreamInfo} either the member's last stream or the overall queue's last stream to be played. null if the general queue is empty
     */
    pop(id, useGeneralQueue = true) {
        var streamInfo;

        if (typeof id === 'boolean') {
            useGeneralQueue = id;
            id = undefined;
        }

        if (this.collectionQueue.size > 0) {
            const entry = this.hasMember(id) ? this.collectionQueue.get(id)
                : typeof id !== 'undefined' && useGeneralQueue ? this.collectionQueue.last()
                : null;
            
            if (!entry) {
                streamInfo = null;
            } else {
                streamInfo = entry.queue.pop();

                if (entry.queue.length === 0) { // get rid of member from collection if queue is empty
                    this.collectionQueue.delete(streamInfo.id);
                }
            }
        } else {
            streamInfo = null;
        }
        return streamInfo;
    }

    /**
     * Gets a numbered list of audio titles for either the specified member or everyone's queue
     * @param {Snowflake} [id] the member id to search for in the collection queue
     * @return {String} a list of audio titles from either the member's queue or the overall queue. An empty string if overall queue is empty
     */
    // TODO: add a now playing message in there too
    getQueueList(id) {
        var list = '';

        if (this.collectionQueue.size > 0) {
            if (this.hasMember(id)) {
                const memberEntry = this.collectionQueue.get(id); // memberEntry = { {GuildMember} member, {Array<StreamInfo>} queue }

                list = `${memberEntry.member.displayName}\n${
                    memberEntry.queue.map( (streamInfo, i) => `\t${i + 1}: ${streamInfo.videoInfo.title}` )
                        .join('\n')
                }`;
                    
            } else if (id === undefined || id === null) {
                const entries = this.collectionQueue.array();

                for (const entry of entries) { // entry = { {GuildMember} member, {Array<StreamInfo>} queue }
                    list += `${entry.member.displayName}\n${
                        entry.queue.map( (streamInfo, i) => `\t${i + 1}: ${streamInfo.videoInfo.title}` )
                            .join('\n')
                    }\n`;
                }
            }
        }
        
        return list;
    }

    /**
     * Enqueues audio to the member's personal queue and edits the bot's sent message to indicate personal queue status
     * @param {StreamInfo} streamInfo the information about the stream to be queued
     *    Defaults to the bot's last sent message
     */
    enqueue(streamInfo) {
        var entry = this.collectionQueue.get(streamInfo.id);
        var newUser = Boolean(!entry);
        var queue;

        if (newUser) {
            queue = this.collectionQueue
                .set(streamInfo.id, { member: streamInfo.botMessage.guild.members.get(streamInfo.id), queue: [] })
                .get(streamInfo.id)
                .queue;
        } else {
            queue = entry.queue;
        }
        queue.push(streamInfo);
        streamInfo.botMessage.edit(`*Added* __**${streamInfo.videoInfo.title}**__ to your playlist\n\n`
            + `${newUser ? `*Use \`!${this.playCmd.name}\` by itself to play this troll shit nao!*\n`
            + `*Use \`!help ${this.playCmd.name}\` to display moar options*`: ``}\n\n`
        );
    }
    // TODO: lets make this return a boolean that indicates new user or not
    
}

module.exports = QueueManager;