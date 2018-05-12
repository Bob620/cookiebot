const Command = require('../models/command'),
      constants = require('../util/constants');

class StringCommand extends Command {
	constructor(id) {
		super(id, constants.commandTypes.STRING);
	}

	async execute(message) {
		return (await this.getOptions())[0];
	}
}

module.exports = StringCommand;