const Command = require('../../src/bot/command/CommandPlus');
const { RichEmbed } = require('discord.js');

class Test extends Command {
    constructor(bot, options) {
        super(bot, {
            name: 'test',
            cooldownTime: 3,
            minArgs: 0,
            hasMultipleArgs: true,
            usage: '!test <whatever test is setup to accept>',
            description: 'Test command to test out certain sum methods'
        });
    }
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
        this.bot.send({
            message: '-0-',
            embed: new RichEmbed()
                .setColor(0xf4a460)
                .setURL('https://beeg.com')
                .setFooter('Test', 'https://beeg.com/static/img/logo/logo.png')
                // .setAuthor('allah', 'https://beeg.com/static/img/logo/logo.png', 'https://beeg.com')
                .setImage('https://beeg.com/static/img/logo/logo.png')
                .setDescription(argInfo.argv[0] || 'Just pr0n'),
            to: argInfo.message.channel
            });
        promise.resolve();
    }
}

module.exports = Test;