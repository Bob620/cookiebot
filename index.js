const Random = require("random-js");

const Bot = require('./bot'),
      config = require('./config/config');

const cookieBot = new Bot({token: config.token, random: new Random(Random.engines.mt19937().autoSeed())});

cookieBot.init().then(() => {
	console.log('Cookiebot initialized');
}).catch(err => {
	console.log(err);
});