const { h, s, get } = require('../util/datastore'),
      StringCommand = require('../models/stringcommand'),
      RandomCommand = require('../models/randomcommand'),
      constants = require('../util/constants'),
      config = require('../config/config');

class BotSettings {
	constructor(random) {
		this.data = {
			random,
			prefix: `${config.redis.prefix}`,
			commands: new Map()
		};

		this.refreshCommands().then(() => {
			console.log('All commands initialized');
		}).catch(err => {
			console.log(err);
		});
	}

	async refreshCommands() {
		for (const commandId of await this.getCommands())
			await this.createCommand(commandId);
	}

	async createCommand(commandId) {
		let command;
		switch(await this.getCommandType(commandId)) {
			case constants.commandTypes.STRING:
				command = new StringCommand(commandId);
				break;
			case constants.commandTypes.RANDOM:
				command = new RandomCommand(commandId, this.data.random);
				break;
			default:
				return;
		}
		console.log(`${commandId}:${await command.getName()} Initialized`);

		this.data.commands.set(await command.getName(), command);
	}

	async getCommand(commandName) {
		const command = this.data.commands.get(commandName);
		if (!command) {
			await this.refreshCommands();
			return this.data.commands.get(commandName);
		}
		return command;
	}

	getCommandType(commandId) {
		return get(`${this.data.prefix}:${constants.database.commands.BASE}:${commandId}:${constants.database.commands.TYPE}`);
	}

	getSettings() {
		return h.getAll(`${this.data.prefix}:${constants.database.SETTINGS}`);
	}

	getBotName() {
		return get(`${this.data.prefix}:${constants.database.BOTNAME}`);
	}

	getMaxGuilds() {
		return get(`${this.data.prefix}:${constants.database.MAXGUILDS}`);
	}

	getCommands() {
		return s.members(`${this.data.prefix}:${constants.database.commands.BASE}`);
	}

	getGuildIds() {
		return s.members(`${this.data.prefix}:${constants.database.guilds.BASE}`);
	}

	addGuild(guildId) {
		return s.add(`${this.data.prefix}:${constants.database.guilds.BASE}`, guildId);
	}

	remGuild(guildId) {
		return s.rem(`${this.data.prefix}:${constants.database.guilds.BASE}`, guildId);
	}
}

module.exports = BotSettings;