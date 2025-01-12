const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyAgent = new HttpsProxyAgent('http://xbypbesm:ax1a8oqpx1lv@198.23.239.134:6540');

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function generate(interaction)
{
    nsfw = interaction.options.getBoolean('nsfw');
    if (nsfw == undefined) { nsfw = false };
    axios.get('https://nekos.moe/api/v1/random/image?nsfw=' + nsfw, { httpsAgent: proxyAgent })
  .then(async response => {
    const ID = response.data.images[0].id;
    await interaction.reply("https://nekos.moe/image/" + ID);
    //await getImage(ID);
  })
  .catch(error => {
    console.error('Error:', error);
  });
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('neko')
		.setDescription('Get neko image from database')
        .addBooleanOption(option =>
            option.setName('nsfw')
                .setDescription('not safe for work')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		await generate(interaction);
	},
};


