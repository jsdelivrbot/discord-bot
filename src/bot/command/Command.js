/**
* executable commands for bot
* use Collection container class for the regex
*/

/**
    big change: you can look at commando.command and change this to be like that
*/
'use strict';
const { Client } = require('discord.js');
const { commands } = require('./CommandList');
const { wholeWords, partWords } = require('./CommandWordList');
const Util = require('../../util/Util');
const Constants = require('../../util/Constants');
const now = require('performance-now');

class Command {
    constructor(bot) {
        if ( !bot || !(bot instanceof Client) ) {
            throw new Error(`A valid client instance is required`);
        }
        this._bot = bot;

        this._wholeWordsRegExp = new RegExp(Object.keys(wholeWords).map(word => `\\b${ word }\\b`)
            .join('|'), 'g');
        this._partWordsRegExpList = [];

        for (const partWordRegExp in partWords) {
            this._partWordsRegExpList.push(new RegExp(partWordRegExp, 'g'));
        }
    }

    get triggerWordsRegex() {
        return this._wordsRegex;
    }

    run( { cmd = 'help', args = [], options, argc = args.length, message } = {} ) {
        cmd = cmd.startsWith('!') ? cmd.slice(1, cmd.length) : cmd;
        const parsedCmd = commands[ cmd ];

        // todo: parse args if sent an unparsed string

        if (!parsedCmd) {
            this._bot.send({ 
                message: `!${ cmd } is not a command you `
                + `${Util.getRandomItem(Constants.MSG_BAD_WORDS)}! `
                + `Use !help to display available commands`,
                to: message ? message.channel : this._bot.defaultTextChannel // send message to the right channel
            });
        } else if (argc < parsedCmd.minArgs) {
            this._bot.send({
                message: `Usage: ${parsedCmd.usage}`,
                to: message ? message.channel : this._bot.defaultTextChannel // same here
            });
        } else {
            // if this function was triggered via chat
            if (message) {
                message.react(Util.getRandomItem(Constants.EMOJI_FACES));
            }

            new Promise((resolve, reject) => {
                // if this function was triggered via chat
                if (message) {
                    message.channel.startTyping();
                } else {
                    this._bot.defaultTextChannel.startTyping();
                }
                parsedCmd.exec({ bot: this._bot, message, promise: { resolve, reject }, args, options });
            })
            .then(() => {
                if (message) {
                    message.channel.stopTyping();
                } else {
                    this._bot.defaultTextChannel.stopTyping();
                }
            })
            .catch(err => {
                if (message) {
                    message.channel.stopTyping();
                } else {
                    this._bot.defaultTextChannel.stopTyping();
                }
                this._bot.log(`CommandError in ${cmd}`);
                this._bot.log(err); // for now
                this._bot.send({
                    message: `Oh noez an error has occured! Pls halp us fix this by submitting a ticket to Joobisoft Support`,
                    to: message.channel
                });
            });
        }
    }

    /**
    * @param {String} text the text message to examine for commands
    * @return {ArgumentInfo} name: command name, args: array of args, options: array of options, argc: arg count
    */
    parse(text) {
        var optionsRegExp = /-\b\w\b|--[\w-]+/g; // for now, matches -(single character) and --(whole word). i wanna also match words after options like -v dosomething

        if (!text || typeof text !== 'string' || !text.startsWith('!')) {
            return null;
        } else {
            var argList = text.replace(optionsRegExp, '')
                .trim()
                .split(' ');
            var optionsList = text.match(optionsRegExp) || [];     

            return {
                cmd: argList[0].slice(1), // command without ! prefix
                args: argList.slice(1, argList.length), // array of args
                options: optionsList, // array of options, ie: -q --queue 
                argc: argList.length === 0 ? 0 : argList.length - 1 + optionsList.length // arg count, including options
            };
        }
    }

    /**
    * Processes last sent message for commands
    * @param {}
    */
    processMessage(message) {
        if (!message) return;

        const parsedCmd = this.parse(message.content);

        if (parsedCmd) {
            this.run({ cmd: parsedCmd.cmd, args: parsedCmd.args, options: parsedCmd.options, argc: parsedCmd.argc, message }); //maybe just send channel from message
        } else {
            this._processTriggerWords(message);
        }
        
    }

    _processTriggerWords(message) {
        const timer = now();

        const cleanedText = Util.ashleyTheStripper(message.content).toLowerCase();
        const matchedWholeWordsList = cleanedText.match(this._wholeWordsRegExp);

        if (matchedWholeWordsList) {
            for (const word of matchedWholeWordsList) { // grab and execute functions associated with matched words
                wholeWords[ word ](message);
            }
            this._bot.log(`${cleanedText} ---- wholeWordsRegExp took: ${now() - timer}`, { consoleOnly: true });
        } else {
            for (const wordRegExp of this._partWordsRegExpList) { // grab and execute functions associated with matched words
                if (wordRegExp.test(cleanedText)) {
                    partWords[ wordRegExp.source ](message); // something like that
                }
            }
            this._bot.log(`${cleanedText} ---- partWordsRegExp took: ${now() - timer}`, { consoleOnly: true });
        }

    }
}

module.exports = Command;
