const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('setlang')
		.setDescription('[Config] alterar linguagem do bot para você')
		.addStringOption(option =>
			option.setName('lang')
				.setDescription('Linguagem')
				.setRequired(true)
				.addChoices({ name: 'English', value: 'en-us' }, { name: 'Português Brasileiro', value: 'pt-br' }, { name: 'Italiano', value: 'it-it' }, { name: "Türkçe", value: "tr-tr" }, { name: "UwU English", value: "en-uwu" }, { name: "Deutsch", value: "de-de" }, { name: "Français Canadien", value: "fr-ca" })
		),

	async execute(client, interaction) {
		const user = await client.db.user.findOne({ _id: interaction.user.id });
		if (!user) return;
		user.lang = interaction.options.getString('lang');
		user.save();
		const lang = client.lang(user.lang)
		interaction.reply(lang.setlang.success.text)
	},

};
