const EventEmitter = require('events');

const Discord = require('discord.js');

const BotSettings = require('./util/botsettings'),
      Guild = require('./models/guild');

class Bot extends EventEmitter {
	constructor({token, random}) {
		super();

		this.data = {
			botSettings: new BotSettings(random),
			random,
			client: new Discord.Client(),
			guilds: new Map(),
			initialized: false,
			uninitializedGuilds: []
		};

		this.data.client.on('ready', () => {
			console.log('Connected to discord');
			this.emit('ready');
		});

		this.data.client.on('error', err => {
			console.log(err);
		});

		this.data.client.on('disconnect', () => {
			console.log('disconnected from discord');
			this.emit('disconnect');
		});

		this.data.client.on('guildCreate', this.addGuild.bind(this));
		this.data.client.on('guildDelete', this.leftGuild.bind(this));

		this.data.client.on('message', async message => {
			if (message.channel.type === 'text' && this.guildExists(message.guild.id)) {
				const guild = this.data.guilds.get(message.guild.id);
				const prefix = await guild.getPrefix();
				if (!await guild.onBlacklist(message.channel.id) && message.content.startsWith(prefix)) {
					const content = message.content.split(' ');
					const commandName = content.shift().substring(prefix.length);
					let returnMessage;

					if (commandName === 'help') {
						const command = await this.data.botSettings.getCommand(content.shift());
						if (command)
							returnMessage = await command.help();
					} else {
						const command = await this.data.botSettings.getCommand(commandName);
						if (command)
							returnMessage = await command.beginExecute(message.channel.id, content);
					}

					if (returnMessage !== undefined && returnMessage !== '')
						message.channel.send(returnMessage);
				}
			}
		});

		this.data.client.login(token);
	}

	async init() {
		for (const guildId of await this.data.botSettings.getGuildIds())
			this.data.guilds.set(guildId, new Guild(guildId));

		this.data.initialized = true;

		for (guild of this.data.uninitializedGuilds)
			await this.addGuild(guild);
	}

	isInitialized() {
		return this.data.initialized;
	}

	guildExists(guildId) {
		return this.data.guilds.has(guildId);
	}

	async hasMaxGuilds() {
		return (await this.data.botSettings.getMaxGuilds()) < this.data.client.guilds.size;
	}

	async addGuild(guild) {
		if (this.isInitialized())
			if (!this.guildExists(guild.id))
				if (await !this.hasMaxGuilds()) {
					console.log(`Bot joined guild ${guild.id}`);
					this.data.botSettings.addGuild(guild.id);
					this.data.guilds.set(guild.id, new Guild(guild.id));
				} else {
					guild.leave().then(guild => {
						console.log(`Left ${guild.id}`);
					});
				}
			else
				console.log(`Bot listening in guild ${guild.id}`);
		else
			this.data.uninitializedGuilds.push(guild);
	}

	async leftGuild(guild) {
		if (this.guildExists(guild.id)) {
			this.data.guilds.delete(guild.id);
		}
	}
}

module.exports = Bot;