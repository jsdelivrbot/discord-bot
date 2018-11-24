/**

ISSUES TO ADDRESS
- bot doesnt play youtube stream if a stream is running
- websocket connection can die out sometimes and cause problems
- slow down twitter reconnections if that websocket connection dies 
- shift over to sending the channel associated with messages - done

STUFF TO ADD
- trivia
- roll the dice
- slap
- queue for play command
- services class
- spam check!

*/

'use strict';

// checks if we're running in heroku environment
if ( !(process.env.HEROKU_CLI_BINPATH || process.env.DYNO) ) {
    require('dotenv').config();
}

const Constants = require('./util/Constants');
const Util = require('./util/Util');

const Bot = require('./bot/Bot');
const Tweeter = require('./extensions/Tweeter');

const {
    defaultBotPresenceName:name,
    defaultBotPresenceUrl:url,
    defaultBotPresenceType:type,
    maxMemberMuteCount:maxMuteCount
} = require('../config.json');

const muteMemberCount = {};

const bot = new Bot();

// starting point
process.on('SIGTERM', () => exit('SIGTERM'))
    .on('SIGINT', () => {
        bot.log('Cycling bot...')
        exit('SIGINT');
    })
    .on('uncaughtException', err => {
        bot.log(`**Critical** An UncaughtException has occurred!\n${err.name}: ${err.message}\nRestarting bot...`)
        console.log(err);
        exit('UncaughtException');
    });

bot.login(process.env.DISCORD_BOT_KEY);
bot.once('ready', init);

// handlers
function handleMessage(message) {
    if (message.author.bot) return;

    else if ( message.isMentioned(bot.user) ) {
        message.reply(`no`);
    } else if (message.content === 'z') {
        message.reply('z');
    }
    else {
        bot.commandManager.processMessage(message);
    }
}

function memberAdd(member) {
    bot.send({
        message: 'welcome message goes here' 
    });
}

function memberRemove(member) {
    bot.send({
        message: `${member} has left the server!`
    });
}

function handleLog(text) {
    bot.send({ message: text, to: 'logs' }); //id 369080766153621504
}

function exit(signal) {
    bot.log(`Terminating bot per signal: ${signal}`);
    process.exit(Constants.EXIT_CODES[signal] || 404);
}

// initializer for bot
function init() {
    
    /* Discord */
    bot.log('Init: Ready');
    bot.user.setPresence({ status: 'online', game: { name, type } });

    // Events
    bot.on('error', err => {
        bot.log(`Bot error event emitted. Check console for more info`);
        bot.log(err, {consoleOnly: true});
        }) // this is where that error event came from
        .on('log', handleLog) // i dunno
        .on('message', handleMessage)
        .on('guildMemberAdd', memberAdd)
        .on('guildMemberRemove', memberRemove)
        .on('disconnected', event => {
            bot.log(`WebSocket connection closed with status ${event.code}`);
            exit(event.code);
        })
        .on('reconnecting', () => {
            bot.log('ws connection lost, reconnecting...');
        })
        .on('resume', replayed => {
            bot.log(`ws connection restored, number of replayed events: ${replayed}`);
        })
        .on('voiceStateUpdate', (oldMember, newMember) => {
            if (bot.displayName === newMember.displayName) { // if trumpbot is changing voice states
                if (newMember.serverMute) {
                    bot.send({ message: `No serber muting ${bot.displayName} you ${Util.getRandomItem(Constants.MSG_BAD_WORDS)}!`, tts: true });
                    newMember.setMute(false);
                } else if (newMember.serverDeaf) {
                    bot.send({ message: `No serber deafing ${bot.displayName} you ${Util.getRandomItem(Constants.MSG_BAD_WORDS)}!`, tts: true });
                    newMember.setDeaf(false);
                }
            } else if (oldMember.voiceChannelID !== newMember.voiceChannelID) {
                bot.log(
                    `voiceStateUpdate: ${newMember.displayName} ${newMember.voiceChannelID ? 'connected to' : 'disconnected from'} `
                    + `${newMember.voiceChannelID ? newMember.voiceChannel.name : oldMember.voiceChannel.name}`
                );
            } else if (newMember.mute) {
                const muteCount = muteMemberCount[newMember.id];

                if (muteCount && ++muteMemberCount[newMember.id] % maxMuteCount === 0) {
                    bot.send({ message: `dude <@${newMember.id}> chill da fuck out with ur excessive muting`, tts: true });
                } else if (!muteCount) {
                    muteMemberCount[newMember.id] = 1;
                }
            }
        })
        .on('guildMemberUpdate', (oldMember, newMember) => {
            bot.send({ message: `**${oldMember.displayName} changed their nickname to ${newMember.displayName}**` })
        })
        .on('guildMemberAvailable', member => {
            bot.log(`guildMemberAvailable: ${member.displayName} logged on`);
        })
    // Daily
        .on('420', () => {
            bot.commandManager.run({ name: 'sotn' });
        })

    // Tweeter
        // .on('tweeterReady', () => { //25073877 - trump | 759251 - cnn
        //     tweeter.streamTweets({ to: bot.channels.get('362462512752492555'), follow: '45661613,25073877' }); // maybe design this so that it can be like stream {follow: 'ids', channel: ''}
        //     tweeter.streamTweets({ to: bot.channels.get('346190968447434755'), follow: '428333,759251' });
        // });

    const tweeter = new Tweeter(bot, {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_TOKEN_SECRET
    });
}