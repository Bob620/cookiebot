const { s, get } = require('../util/datastore'),
      constants = require('../util/constants'),
      config = require('../config/config');

class Command {
	constructor(id, type) {
		this.data = {
			id,
			prefix: `${config.redis.prefix}:${constants.database.commands.BASE}:${id}`,
			type
		}
	}

	getId() {
		return this.data.id;
	}

	async getOptions() {
		return await s.members(`${this.data.prefix}:${constants.database.commands.OPTIONS}`);
	}

	async getType() {
		return await get(`${this.data.prefix}:${constants.database.commands.TYPE}`);
	}

	async getName() {
		return await get(`${this.data.prefix}:${constants.database.commands.NAME}`);
	}

	async getBlacklist() {
		return await s.members(`${this.data.prefix}:${constants.database.commands.BLACKLIST}`);
	}

	async onBlacklist(channelId) {
		return !!await s.ismember(`${this.data.prefix}:${constants.database.commands.BLACKLIST}`, channelId);
	}

	async help() {
		return await get(`${this.data.prefix}:${constants.database.commands.HELP}`);
	}

	async beginExecute(channelId, message) {
		if (!await this.onBlacklist(channelId)) {
			return await this.execute(message);
		}
	}

	async execute(message) {

	}
}

module.exports = Command;