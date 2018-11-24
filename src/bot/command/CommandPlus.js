
// CommandManager class that handles status of command and has client.

/**

throttle timer
min args, default args

*/
class CommandPlus {
	constructor(bot, options) {
		/**
		 * @type {Bot}
		 */
		this.bot = bot; // client
		
		this.ownerOnly = options.ownerOnly || false;
		this.requiredRoles = options.roles || [];
		this.cooldownTime = options.cooldownTime || 0; // if command is throttled from spam abuse
		this.minArgs = options.minArgs || 0; // minimum args required to run command
		this.hasMultipleArgs = options.hasMultipleArgs || false; // if args should be spilt into multiple args or kept as a single arg
		this.usage = options.usage || 'No usage info provided'// usage info for command
		this.description = options.description || 'No description provided'; // description of the command
		this.name = options.name || this.constructor.name; // name of the command
	}
	/**
     * @typedef {Object} ArgInfo
     * @property {String} name the name of the command
     * @property {Array<String>} argv a list of arguments sent to the command
     * @property {Number} argc the number of arguments
     * @property {Message} message the message that triggered this command
     */

	get commandList() {
		return this.bot.commandManager.commandList;
	}

	get wordList() {
		return this.bot.commandManager.wordList;
	}

    /**
     * entry point for command
     * @param {ArgInfo} argInfo information about the arguments sent to this command
     * @param {Promise} promise resolve to signal successful execution of command, reject to signal command failure
     */
	run() {
		throw new Error(`${this.constructor.name} must implement a run() method`);
	}
}

module.exports = CommandPlus;