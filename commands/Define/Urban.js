const Command = require('../../src/bot/command/CommandPlus');
const UD = require('../../api/UrbanDictionary');
const { RichEmbed } = require('discord.js');
const Util = require('../../src/util/Util');
const { MSG_TRIGGER_TEXTS, MSG_TRIGGER_HASHTAGS } = require('../../src/util/Constants');

class Define extends Command {
    constructor(bot, options) {
        super(bot, {
            name: 'define',
            cooldownTime: 1,
            minArgs: 1,
            hasMultipleArgs: false,
            usage: '!define <troll word(s)>\n\nExample:\n\t!define assburgers',
            description: 'Displays lolzy definitions for your troll words'
        });
    }
    /**
     * @typedef {Object} UrbanInfo
     * @property {UrbanEntry} entry an entry that contains information about the query
     * @property {Array<String>} tags the tags associated with the query
     * @property {Array<String>} sounds the urls to any sounds associated with the query
     * @property {String} result_type whether the query resulted in an exact match or relevant match or no match
     */
    /**
     * @typedef {Object} ArgInfo
     * @property {String} name the name of the command
     * @property {Array<String>} argv a list of arguments sent to the command
     * @property {Number} argc the number of arguments
     * @property {Message} message the message that triggered this command
     */
    /**
     * entry point for command
     * @param {ArgInfo} argInfo information about the arguments sent to this command
     * @param {Promise} promise resolve to signal successful execution of command, reject to signal command failure
     */
    run(argInfo, promise) {
        UD.search(argInfo.argv[0], { random: true })
            .then(entry => {
                this.bot.send({
                    message: !entry ? `There aren't any definitions for ${argInfo.argv[0]} yet! ¯\\_(ツ)_/¯` 
                        : this.createRichEmbed(entry),
                    to: argInfo.message.channel
                });
                promise.resolve();
            })
            .catch(promise.reject);
    }

    /**
     * Creates a rich embed for the results of the query
     * @param {UrbanInfo} info the information associated with the query
     * @return {RichEmbed} the rich embed that contains results of the query
     */
    createRichEmbed(entry) {
        const asshurtLevel = this.calculateAsshurtLevel(entry.thumbs_up, entry.thumbs_down);
        const embed = new RichEmbed()
            .setColor(0xf4a460)
            .setURL(entry.permalink)
            .setTitle(entry.word)
            .setFooter(entry.author, 'https://cdn.discordapp.com/icons/199959864854839296/7e9cb172f23f4b78d3b026ef89c18294.png');

        if (entry.definition.length > 0) { // check if there is a definition
            embed.setDescription(Util.truncate(entry.definition, { maxLength: 2000, endChar: ' ', append: '...' })); //  maybe switch to addField so you can loop this
        }
        if (entry.example.length > 0) { // check if there is an example
            embed.addField('Example', Util.truncate(entry.example, { maxLength: 1180, endChar: ' ', append: '...' }))
        }
        if (entry.written_on) {
            embed.setTimestamp(entry.written_on);
        }
        embed.addField('Asshurt Level', `${asshurtLevel}%`, true);

        if (asshurtLevel >= 90) { // determine which asshurt field to apply
            embed.addField('CRITICAL: ASSHURT LEVELS OVER 9000', `WAHHHHHHHHHHHH CALL A WaHhHhHhHmBuLaNcE N b0Yc0tT NaO!! #${Util.getRandomItem(MSG_TRIGGER_HASHTAGS)}`);
        } else if (asshurtLevel >= 70) {
            embed.addField('Warning: Triggered snowflakes detected', `Tread carefully`)
        } else if (asshurtLevel >= 50) {
            embed.addField('Caution!!', `Watch what you say and do`)
        }

        return embed;
    }

    /**
     * Calculates the asshurt level percentage from likes and dislikes of entry
     * @param {Number} likes amount of likes the entry got
     * @param {Number} dislikes amount of dislikes the entry got
     * @return {Number} a number between 0 and 100, inclusive. the more the merrier
     */
    calculateAsshurtLevel(likes, dislikes) {
        var total = likes + dislikes;
        
        if (total === 0) {
            total = 1;
        }
        return Math.round(((dislikes / total) * 100).toFixed(2));
    }
}

module.exports = Define;