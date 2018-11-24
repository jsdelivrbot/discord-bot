const Command = require('../../src/bot/command/CommandPlus');

class Help extends Command {
    constructor(bot, options) {
        super(bot, {
            name: 'help',
            cooldownTime: 2,
            minArgs: 0,
            hasMultipleArgs: true,
            usage: '!help [command name(s)]\n\nExample:\n\t!help play\n\t!help define trivia',
            description: 'Displays a description of all commands or usage information for a specific command'
        });
        this.bot.once('ready', () => {
            this.helpAllCommandsText = this._generateAllCommandsText()
        });
    }

    //{ argInfo: { cmd, argv, argc, message }, promise: { resolve, reject }
    run(argInfo, promise) {
        if (argInfo.argc > 0) {
            var helpMessage = '';

            argInfo.argv.forEach(cmdName => { // find each argument command name in the commands list
                const cmd = this.commandList.get(cmdName);

                helpMessage += cmd ? `${cmd.usage}\n\n` : `+ ${cmdName} does not exist\n\n`;
            });
            this.bot.send({ message: helpMessage, to: argInfo.message.channel, code: 'diff' })
        } else {
            this.bot.send({ message: this.helpAllCommandsText, to: argInfo.message.channel, code: 'diff' }); // send all command usage info
        }
        promise.resolve();
    }

    _generateAllCommandsText() {
        var helpMessage = 'Use `!help <command name(s)>` to display more detailed help for specific commands\nExample: `!help play`\n\n';

        this.commandList.forEach((cmd, cmdName) => {
            helpMessage += `!${ cmdName }: ${ cmd.description }\n`;
        });
        
        return `${helpMessage}\nIt can take a few seconds to register commands (thanks to shitty TripWHORE Interactive)`;
    }
}

module.exports = Help;