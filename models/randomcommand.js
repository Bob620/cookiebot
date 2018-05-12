const Command = require('../models/command'),
      constants = require('../util/constants');

class RandomCommand extends Command {
	constructor(id, random) {
		super(id, constants.commandTypes.RANDOM);

		this.data.random = random;
	}

	async execute() {
		this.data.random.pick(await this.getOptions());
		return this.data.random.pick(await this.getOptions());
	}
}

module.exports = RandomCommand;