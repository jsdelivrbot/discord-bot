/*jshint esversion: 6*/
'use strict';
const { Client, Message, Channel, TextChannel, VoiceChannel, RichEmbed } = require('discord.js');
const Player = require('./player/Player');
const Constants = require('../util/Constants');
const Util = require('../util/Util');
const nodeUtil = require('util'); // node util

//const Extensions = require('./Extensions');
const Command = require('./command/Command');
const CommandManager = require('./command/CommandManager');

const connectionEvents = ['error', 'failed', 'warn'];

/**
 * Bot class that represents a Discord chat bot
 * @extends {Client}
 */
class Bot extends Client {
    constructor() {
        if (!process.env.PWD) {
            throw new Error(`PWD environment variable is not set! You must set PWD (the parent directory of DiscordBot) in your .env file`);
        }
        super();
        
        this.defaultTextChannel = null;
        this.defaultVoiceChannel = null;

        //this.command = new Command(this);
        this.player = new Player(this);
        this.commandManager = new CommandManager(this);
        //this.extensions = {};

        this.once('ready', this._setup);
        this.on('voiceStateUpdate', this._handleVoiceState);
    }

    // since this bot will only be used in one guild
    _setup() {
        this.defaultTextChannel = this.channels.find('type', 'text');
        this.defaultVoiceChannel = this.channels.find('type', 'voice');

        this.fetchWebhook(Constants.ID_WEBHOOK_GENERAL).then(hook => { this.defaultWebhook = hook }); // for defaultWebhook

        this._four_twenty();
        this._seven_ten();
    }

    _handleVoiceState(oldMember, newMember) {
        const connection = this.voiceConnections.first();
        
        if (connection && oldMember.user.bot && connection._eventCount <= 3) { // eventCount condition is for when the bot is already connected to a voice channel when the bot first boots up
            for (const event of connectionEvents) {
                connection.on(event, info => {
                    this.emit('streamEvent', event, info);
                });
            }
        }
    }

    /**
    * @return {String} current display name of this bot
    * @readonly
    */
    get displayName() {
        return this.guilds.first().members.get(this.user.id).displayName;
    }

    /**
    * @return {Collection<Snowflake, Emoji>} emojis in this guild
    * @readonly
    */
    // get emojis() {
    //     return this.guilds.first().emojis;
    // }

    /**
    * @return {Collection<Snowflake, GuildMember>} members in this guild
    * @readonly
    */
    get members() {
        return this.guilds.first().members;
    }

    _four_twenty () {
        setTimeout(() => {
            this.emit("420");
            this._four_twenty();
        }, Util.getMillisecondsUntil(16, 20));
    }

    _seven_ten () {
        setTimeout(() => {
            this.emit('710');
            this._seven_ten();
        }, Util.getMillisecondsUntil(19, 10));
    }

    /**
    * @typedef {WebhookContent}
    * usermessage: 'name',
    * avatar_url: 'http://media3.popsugar-assets.com/files/2014/11/14/759/n/1922729/a47fe337860c7f89_1001532759tBRP4.xxxlarge_2x/i/Rum-Coke.jpg',
    * message: `Drink of the night: ${this.drink}`,
    * channel: message.channel.name,
    * tts: 'true'
    */

    getWebhook(channel) {
        var webhookResolver = (resolve, reject) => {
            if (!channel) {
                resolve(this.defaultWebhook);
            } else {
                channel.fetchWebhooks().then(webHooks => {
                    if (webHooks.size > 0) {
                        resolve(webHooks.first());
                    } else {
                        // if no webhooks exist with this channel create one
                        channel.createWebhook('default', Constants.DEFAULT_AVATAR_URL, 'do you really need a reason?')
                            .then(newWebhook => resolve(newWebhook));
                    }
                })
                .catch(reject);
            }
        }

        return new Promise(webhookResolver);
    }


    findChannel(resolvable) {
        var channel = null;

        if (!resolvable) {
            channel = null;
        } else if (resolvable instanceof Channel) {
            channel = resolvable;
        } else if (typeof resolvable === 'string') {
            channel = this.channels.find('name', resolvable) || this.channels.has(resolvable);
        } else if (resolvable instanceof Message) {
            channel = resolvable.channel;
        } 
        return channel;  
    }

    /**
    * Sends message to a channel or webhook
    * @param {*} content the text to send
    * @param {String|TextChannelResolvable} [channel=this.defaultTextChannel] the channel to send the message to
    * @returns {Promise<Message>} an instance of the message that was successfully sent
    */
    send({ message, to:channelResolvable = this.defaultTextChannel, tts = false, username, avatarURL, split = true, code, files, embed, reply, nonce, disableEveryone } = {} ) {
        var channel = this.findChannel(channelResolvable);

        if (!(message || embed)) {
            message = '🤔';
        } else if (message instanceof RichEmbed) { 
            embed = message;
            message = '';
        }

        // send on webhook if these are defined
        if (username || avatarURL) {
            return this.getWebhook(channel).then(webhook => {
                return webhook.send(message, { username, avatarURL, files, code, tts, embed, reply, split, nonce, disableEveryone })
            })
            .catch(this.log);
        } else if ( !(channel instanceof TextChannel) ) {
            throw new TypeError(`A valid resolvable text channel is required in order to send messages`);
        } 
        return channel.send(message, { files, code, tts, embed, reply, split, nonce, disableEveryone })
            .catch(this.log);
        
    }

    /**
    * Joins the specified voice channel
    * @param {String|VoiceChannel} channel the voice channel to join
    * @returns {Promise<VoiceConnection>} an instance of the VoiceConnection established
    * @private
    */
    joinVoiceChannel(channel) {
        channel = this.findChannel(channel);

        if ( !(channel instanceof VoiceChannel) ) {
            throw new TypeError(`A valid resolvable voice channel is required`);
        } else {
            return channel.join();
        }
    }

    /**
     * Logs a message to a chat channel and console
     * @param {*} logMessage the message to be logged
     * @param {Options} options logging options 
     * @param {Boolean} [options.consoleOnly=false] whether or not the message should be logged to console only
     */
    log(log, { consoleOnly = false } = {}) { // give this two params message, err
        const timestamp = `${ new Date().toTimeString().slice(0, 8) } discord_bot   |  `;
        var logMessage, consoleMessage;

        if (!log) {
            log = String(log);
        } else if (log instanceof Error) {
            log = `**Traceback**\n${log.stack || 'No stack trace is available'}`;
        } else if (log instanceof Object) {
            log = nodeUtil.inspect(log);
        }

        
        logMessage = log.replace(/^|\n/g, `\n${timestamp}`).slice(1); // remove beginning newline with slice
        consoleMessage = !(process.env.HEROKU_CLI_BINPATH || process.env.DYNO) ? logMessage : log // checks runtime environment

        if (!consoleOnly) {
            this.emit('log', logMessage);    
        } 
        console.log(consoleMessage);
        
    }
}

module.exports = Bot;

/*
function splitMessage(text) {
    var messages = [];

    try {
        messages = Util.splitMessage(text, {maxLength: Constants.MAX_MSG_LEN, char: ' '});
    } catch log var start = 0;
        var end = 2000;

        while (start <= text.length) {
            messages.push(text.slice(start, end));
            start += 2000;
            end += 2000;
        }
    }
    return messages;
}

throw er; // Unhandled 'error' event
^

Error: Endpoint not provided from voice server packet.
    at VoiceConnection.authenticateFailed (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\voice\VoiceConnection.js:256:26)
    at VoiceConnection.setTokenAndEndpoint (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\voice\VoiceConnection.js:177:12)
    at ClientVoiceManager.onVoiceServer (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\voice\ClientVoiceManager.js:28:32)
    at emitOne (events.js:96:13)
    at Bot.emit (events.js:188:7)
    at VoiceServerUpdate.handle (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\websocket\packets\handlers\VoiceServerUpdate.js:15:12)
    at WebSocketPacketManager.handle (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\websocket\packets\WebSocketPacketManager.js:102:65)
    at WebSocketConnection.onPacket (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\websocket\WebSocketConnection.js:325:35)
    at WebSocketConnection.onMessage (C:\Users\Albert\Desktop\Discord\node_modules\discord.js\src\client\websocket\WebSocketConnection.js:288:17)
    at WebSocketClient.internalOnMessage (C:\Users\Albert\Desktop\Discord\node_modules\uws\uws.js:102:17)

*/
