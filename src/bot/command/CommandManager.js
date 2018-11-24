
// go through commands directory and instantiate all commands
'use strict';
const { Client, Collection, Message, SnowflakeUtil } = require('discord.js');
const CommandParser = require('./CommandParser');
const Util = require('../../util/Util');
const { MSG_BAD_WORDS, EMOJI_SYMBOLS } = require('../../util/Constants');

class CommandManager {
    constructor(bot) {
        if ( !bot || !(bot instanceof Client) ) {
            throw new Error(`A valid Client instance is required`);
        }

        const { commands_dir, commands } = require(`${process.env.PWD}/config.json`); // config file
        const { keywords } = require(`${process.env.PWD}/${commands_dir}/CommandWordList`); // trigger keywords

        /**
         * @type {Bot}
         */
        this.bot = bot;
        /**
         * @type {Collection}
         */
        this.commandList = new Collection(); // collection of commands - command.name: Command instance
        this.keywordList = new Collection(); // collection of keywords - keyword: { regExp, exec }
        this.parser = new CommandParser(this.commandList, this.keywordList);

        // instantiate the commands and store their info into that collection object

        for (const command of commands) {
            const Command = require(`${process.env.PWD}/${commands_dir}/${command.main}`);
            const cmd = new Command(this.bot, command.options);

            this.commandList.set(cmd.name.toLowerCase(), cmd);
        }
        this.bot.log(`Loaded ${this.commandList.size} commands`, {consoleOnly: true});

        // and also the keywords
        for (const keyword in keywords) {
            this.keywordList.set(keyword, {
                regExp: new RegExp(keyword), // {RegExp} regExp
                exec: keywords[keyword]      // {function} exec
            });
        }
        this.bot.log(`Loaded ${this.keywordList.size} keywords`, {consoleOnly: true});
    }

    /**
     * @typedef {Object} ArgInfo
     * @property {String} name the name of the command
     * @property {Array<String>} argv a list of arguments sent to the command
     * @property {Number} argc the number of arguments
     * @property {Message} message the message that triggered this command
     */

    /**
    * Searches and processes message with commands or keywords
    * @param {Message} message the message instance to process for commands or keywords
    */
    processMessage(message) {
        if (!(message instanceof Message)) {
            this.bot.log('*Warning*: a non-valid instance of Message was sent to processMessage()');
        } else if (message.content.startsWith('!')) { // search for commands
            const parsedArgInfo = this.parser.parseCommand(message);

            this.run(parsedArgInfo);
        } else { // search for keywords
            const parsedWords = this.parser.parseKeywords(message.content);
            
            for (const word of parsedWords) {
                this.keywordList.get(word).exec(message, this.bot);
            }
        }
    }
//todo add roles!! and throttling!!
    /**
     * Executes a command specifed from the registry 
     * @param {ArgInfo} argInfo the information about the command to be ran and its arguments
     * @param {String} argInfo.name the name of the command in the registry to be ran
     * @param {Array<String>} [argInfo.argv=[]] an array of arguments to be sent to the command
     * @param {Number} [argInfo.argc=argv.length] the number of args in argInfo.args
     * @param {Message} [argInfo.message=this.bot.user.lastMessage] the message that triggered a possible command. 
     *      Defaults to a virtual bot message with defaultTextChannel
     */
    run({ name, argv = [], argc = argv.length, message = this._createDefaultMessage() } = {}) {
        if (!(message instanceof Message)) {
            throw new TypeError('A valid instance of Message is required to run a command');
        } else if (!name) {
            throw new TypeError('A valid command name is required to run a command');
        } else if (!message.author.bot) {                               
            message.react(Util.getRandomItem(EMOJI_SYMBOLS));   // only react if message came from a non-bot user
        }
        const foundCmd = this.commandList.get(name)             // grab command instance from commandList
        const argInfo = { name, argv, argc, message };

        if (!foundCmd) {                                        // if command does not exist in registry
            this.bot.send({ 
                message: `!${ name } is not a command you `
                    + `${Util.getRandomItem(MSG_BAD_WORDS)}! `
                    + `Use !help to display available commands`,
                to: message.channel,
                code: 'diff'
            });    
        } else if (argc < foundCmd.minArgs) {                   // if not enough args are sent
            this.bot.send({
                message: `Usage: ${foundCmd.usage}`,
                to: message.channel,
                code: 'diff'
            });
        } else {                                                // execute command
            this._type(message.channel);
            this._exec(foundCmd, argInfo)
                .then(() => message.channel.stopTyping(true))   // this can stop the typing indicator before the timeout finishes
                .catch(err => this._error(err, argInfo));
        }
    }

    _type(channel) {
        if (!channel.typing) {
            channel.startTyping();
        }
        
        this.bot.setTimeout( () => {                            // a timer that will only set timing indicator for 10 seconds
            if (channel.typing) {
                channel.stopTyping(true);
            }
        }, 5000 );
    }

    _exec(cmd, argInfo) {
        return new Promise((resolve, reject) => {
            cmd.run(argInfo, { resolve, reject });
        })
    }

    _createDefaultMessage() {
        return new Message(this.bot.defaultTextChannel, {
            id: SnowflakeUtil.generate(),
            type: 'DEFAULT',
            content: '',
            author: this.bot.user,
            pinned: false,
            tts: false,
            nonce: '',
            embeds: [],
            attachments: [],
            timestamp: Date.now(),
            edited_timestamp: false,
            reactions: []
        }, this.bot);
    }

    _error(err, argInfo) {
        this.bot.log(`Exception caught in ${argInfo.name}`);
        this.bot.log(err);
        this.bot.send({
            message: `Oh noez something went terribad!!! `
                + `Pls halp us fix this by submitting a ticket to Joobisoft Support `
                + `More details can be found in <#369080766153621504>\n\n**#OperationHealth**`,
            to: argInfo.message.channel
        });
        argInfo.message.channel.stopTyping();
    }
}

module.exports = CommandManager;