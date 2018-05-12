const { h, s, get, del } = require('../util/datastore'),
      constants = require('../util/constants'),
      config = require('../config/config');

class Guild {
	constructor(id) {
		this.data = {
			id,
			prefix: `${config.redis.prefix}:${constants.database.guilds.BASE}:${id}`
		}
	}

	getId() {
		return this.data.id;
	}

	async getPrefix() {
		return await get(`${this.data.prefix}:${constants.database.guilds.PREFIX}`);
	}

	async getSettings() {
		return await h.getall(`${this.data.prefix}:${constants.database.guilds.SETTINGS}`);
	}

	async getBlacklist() {
		return await s.members(`${this.data.prefix}:${constants.database.guilds.BLACKLIST}`);
	}

	async onBlacklist(channelId) {
		return !!await s.ismember(`${this.data.prefix}:${constants.database.guilds.BLACKLIST}`, channelId);
	}

	async delete() {
		const settings = Object.keys(await this.getSettings());
		h.del(`${this.data.prefix}:${constants.database.guilds.SETTINGS}`, ...settings);

		const channelIds = await this.getBlacklist();
		for (const channelId of channelIds)
			await s.rem(`${this.data.prefix}:${constants.database.guilds.BLACKLIST}`, channelId);

		await del(`${this.data.prefix}:${constants.database.guilds.PREFIX}`);

		await s.rem(`${config.redis.prefix}:${constants.database.guilds.BASE}`, this.getId());
	}
}

module.exports = Guild;