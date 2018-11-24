const Command = require('../../src/bot/command/CommandPlus');
const nodeUtil = require('util');

class Eval extends Command {
    constructor(bot, options) {
        super(bot, {
            name: 'eval',
            cooldownTime: 3,
            minArgs: 1,
            hasMultipleArgs: false,
            usage: `!eval <shoddy js code>\n\nAvailable variables:\n`
            + `bot {Bot} @extends {Client}\n`
            + `\nExample:\n\t!eval this.bot.send('ur all negroids')\n\t!eval this.bot.log('so fakku')`,
            description: 'Runs ur shoddy js code. Only serber allah can use this command'
        });
    }

    //{ argInfo: { cmd, argv, argc, message }, promise: { resolve, reject }
    run(argInfo, promise) {
        if (argInfo.message.author.id !== process.env.SERVER_OWNER_ID) {
            this.bot.send({ message: `You must have eval or Allah privilege to run this command!`, to: argInfo.message.channel });
            return;
        }
        const bot = this.bot;
        
        try {
            const evalCode = argInfo.argv[0];

            if (evalCode.includes('bot.send') || evalCode.includes('bot.log')) {
                eval(evalCode);
            } else {
                this.bot.send({
                    message: nodeUtil.inspect(eval(evalCode)),
                    to: argInfo.message.channel,
                    code: 'javascript'
                });
            }
        } catch (err) {
            this.bot.log(`EvalCommandError: ${err.message}`);
            this.bot.send({
                message: err.toString(),
                to: argInfo.message.channel,
                code: 'javascript'
            });
        } finally {
            promise.resolve();
        }
    }

}

module.exports = Eval;