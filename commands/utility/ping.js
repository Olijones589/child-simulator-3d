const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check if bot is online'),
	async execute(interaction) {
		await interaction.reply("Don't touch me!");
	},
};
