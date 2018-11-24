const Util = require('../../util/Util');
const { Message } = require('discord.js');

class CommandParser {
    constructor(commands, keywords) {
        this.commands = commands;
        this.keywords = keywords;
    }

    /**
    * @param {Message|String} resolvable the message or text to examine for commands
    * @return {ArgumentInfo} name: command name, args: array of args, options: array of options, argc: arg count
    */
    parseCommand(resolvable) { // will have to send command config that contains config for parsing options, ie: -q grabs nothing while -a grabs the next word
        // or you can search the registry and determine if its a valid command, and then pull its info like that.

        if (!resolvable) {
            return null;
        }
        const text = resolvable instanceof Message ? resolvable.content : resolvable; 
        const optionsRegExp = /\B-[\w]+(?=\s|$)/g; // for now, matches -(whole word). i wanna also match words after options like -v dosomething
        
        const cmdName = text.slice(
                text.startsWith('!') ? 1 : 0 , 
                text.indexOf(' ') < 0 ? text.length : text.indexOf(' ')
            )
            .toLowerCase(); // gets the name of the command without the '!' prefix

        const foundCommand = this.commands.get(cmdName);

        const optionsList = text.match(optionsRegExp) || [];
        var argsList = text.replace(`!${cmdName}`, '')
            .replace(optionsRegExp, '')
            .replace(/\s+/g, ' ')
            .trim();

        argsList = argsList.length === 0 ? []
            : foundCommand && foundCommand.hasMultipleArgs ? argsList.split(' ') 
            : new Array(argsList);

        return {
            name: cmdName, // command name without ! prefix
            argv: argsList.concat(optionsList), // array of args as either one whole string in an array or split up strings in an array
            argc: argsList.length + optionsList.length, // arg count, including options argsList.length === 0 ? 0 : argsList.length - 1 + optionsList.length
            message: resolvable instanceof Message ? resolvable : null,
            subCommands: null
        };
    }

    /**
    * @param {String} text the query text to examine for keywords
    * @param {Collection<String, Object{RegExp, Function}>} keywords a collection of keywords to search for in the query text
    * @return {Array<String>} an array of matched keywords
    */
    parseKeywords(text) {
        const cleanedText = Util.ashleyTheStripper(text).toLowerCase();
        const matchedKeywords = [];
        // const matchedWholeWordsList = cleanedText.match(this._wholeWordsRegExp);

        this.keywords.forEach((value, key) => {
            if (value.regExp.test(cleanedText)) {
                matchedKeywords.push(key);
            }
        });
        return matchedKeywords;
    }
}

module.exports = CommandParser;