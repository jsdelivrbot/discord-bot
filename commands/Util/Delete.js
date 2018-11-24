const Command = require('../../src/bot/command/CommandPlus');

class Delete extends Command {
    constructor(bot, options) {
        super(bot, {
            name: 'delete',
            cooldownTime: 3,
            minArgs: 1,
            hasMultipleArgs: true,
            usage: `!delete <number of messages to delete>\n`
                + `The max number of messages you can delete per command execution is 100\n\n`
                + `Example:\n\t!delete 10`,
            description: 'Deletes a specified number of messages from the channel this command is exceuted in'
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
        const numMessages = parseInt(argInfo.argv[0], 10);

        argInfo.message.channel.fetchMessages({ limit: numMessages >= 100 ? 100 : numMessages + 1 })
            .then(messages => {
                messages.forEach(msg => msg.delete())
            })
            .then(promise.resolve)
            .catch(promise.reject);
    }
}

module.exports = Delete;