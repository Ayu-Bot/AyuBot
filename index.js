const fs = require('fs');
const Discord = require('discord.js');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config/config');
const client = new Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_PRESENCES"] });
const app = require('express')();
const alex = require('alexflipnote.js');
const alexclient = new alex();
const animality = require('animality');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
client.animal = animality
const ms = require('ms')
const { AutoPoster } = require('topgg-autoposter')
const poster = AutoPoster(process.env.topgg, client) // your discord.js or eris client
const { createAudioPlayer, createAudioResource, StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const { inspect } = require("util")
const { codeBlock } = require("@discordjs/builders");
var listen = Math.floor(Math.random(1000) * 9999)
client.listen = listen;
client.queue = new Map();
// client.lang = require('./config/lang.json');
client.lang = function(lang) {
	return require('./config/lang/' + lang + ".json")
}
const db = require("./db.js")
const Canvas = require('canvas');
client.Canvas = Canvas;
const Jimp = require('jimp');
// optional
poster.on('posted', (stats) => { // ran when succesfully posted
	console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`)
})
client.db = db;

// Client 2
bot.on("ready", () => {
	console.log("Heartbeat online")

})
// client.on("debug", console.log)
const config = {
	prefix: "!",
	ownerID: "407859300527243275"
}
const set = new Set();
const clean = require('./config/clean')
client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	// Functions
	const args = message.content.split(' ');
  const command = args.shift().toLowerCase();
  
  if (command === '!!!eval') {
    // Put your userID here
    if (message.author.id !== '407859300527243275') return;
    
    let evaled;
    try {
      evaled = await eval(args.join(' '));
      message.channel.send(`\`\`\`js\n${inspect(evaled)}\`\`\``);
      console.log(inspect(evaled));
    }
    catch (error) {
      console.error(error);
      message.reply(`\`\`\`js\n${error}\`\`\``);
    }
  }

	// Anti-spam
	// require('./system/anti-spam.js')(client, message, set, 1000)
	// Anti-link

})

bot.login(process.env.client2)

client.commands = new Collection();
client.db = require('./db.js')
client.alex = alexclient;
/*app.client = client;*/
module.exports = client;

client.once('ready', () => {
	console.log('Connected !')
	setInterval(time, 16000)
	function time() {
		console.log("Online à " + ms(client.uptime))
		client.user.setActivity(`Prefixo: /`)
	}
	time()



});
client.on("debug", (debug) => {
	//console.log(debug)
})
require('./webdash/server')
const cmd_folders = fs.readdirSync('./commands');
for (const f of cmd_folders) {

	const cmd_files = fs.readdirSync(`./commands/${f}`).filter(file => file.endsWith('.js'));

	for (const file of cmd_files) {

		const cmd = require(`./commands/${f}/${file}`);
		client.commands.set(cmd.data.name, cmd);

	}

}

client.on("guildMemberAdd", async function(member) {
	var g = member.guild;
	client.db.guild.findOne({ _id: g.id }, async function(e, d) {
		try {
			//console.log(member)
			if (!d) return;
			const saved = d.config.welcome.message
				.replace(/{user.username}/g, member.user.username)
				.replace(/{@user}/g, `<@${member.id}>`)
				.replace(/{guild.name}/g, `${member.guild.name}`)
				.replace(/{user.id}/g, `${member.user.id}
`)
			const message = JSON.parse(saved)
			const channel = g.channels.cache.get(d.config.welcome.channel);
			if (!channel) return;
			//.replace("{user.username}", member.username)
			channel.send(message);
		} catch (e) {
			const channel = g.channels.cache.get(d.config.welcome.channel);
			console.log(e)

			if (!channel) return;
			//.replace("{user.username}", member.username)
			channel.send(`${member.user.username} entrou no servidor\n> Ocorreu um erro ao enviar a mensagem personalizada.`)
		}
	})
})
client.on("guildMemberRemove", async function(member) {
	var g = member.guild;
	client.db.guild.findOne({ _id: g.id }, async function(e, d) {
		try {
			//console.log(member)
			if (!d) return;
			const saved = d.config.bye.message
				.replace(/{user.username}/g, member.user.username)

			const message = JSON.parse(saved)
			const channel = g.channels.cache.get(d.config.bye.channel);
			if (!channel) return;
			//.replace("{user.username}", member.username)
			channel.send(message)
		} catch (e) {
			console.log(e)
			const channel = g.channels.cache.get(d.config.welcome.channel);
			if (!channel) return;
			//.replace("{user.username}", member.username)
			channel.send(`${member.user.username} saiu do servidor\n> Ocorreu um erro ao enviar a mensagem personalizada.`)
		}
	})
})

client.on('interactionCreate', async interaction => {

	if (!interaction.isCommand()) return;
	var user = await client.db.user.findOne({ _id: interaction.member.id });
	var guild = await client.db.guild.findOne({ _id: interaction.guild.id });
	if (!guild) {
		new client.db.guild({
			_id: interaction.guild.id,
			name: interaction.guild.name,
			icon: interaction.guild.icon ? interaction.guild.iconURL({ size: 4096 }) : "https://cdn.discordapp.com/embed/avatars/0.png",
			bio: "Um servidor :D",
			verified: false,
			config: {
				welcome: {
					channel: "",
					message: "{\"content\":\"Bem vindo(a) {user.username} ao servidor!\"}"
				},
				bye: {
					channel: "",
					message: "{\"content\":\"{user.username} saiu do servidor.\"}"
				},
				system: {
					antispam: {
						check: false,
						config: {
							blacklist: []
						}
					},
					antilink: false
				}
			}
		}).save()
	}
	if (!user) {
		new client.db.user({
			_id: interaction.member.id,
			lang: "pt-br",
			about: "Olá, parece que ainda não tenho um sobre mim!",
			economy: {
				coins: 500
			}
		}).save();
		//interaction.reply({content:"[Database] Você foi registrado, parabéns!",ephemeral:true})
	}
	const cmd = client.commands.get(interaction.commandName);
	if (!cmd) return;

	try {

		await cmd.execute(client, interaction);

	} catch (e) {

		console.error(e);
		await interaction.reply({ content: 'Oops ! Something went wrong.', ephemeral: true });

	}
});

process.on('uncaughtException', function(err) {
  
    // Handle the error safely
    console.log(err)
})

client.login(process.env.token);