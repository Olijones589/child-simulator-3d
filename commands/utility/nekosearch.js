const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyAgent = new HttpsProxyAgent('http://xbypbesm:ax1a8oqpx1lv@198.23.239.134:6540');

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function getRandomImageId(response) {
  if (!response || !response.images || response.images.length === 0) {
      console.log("No images found.");
      return null;
  }

  const randomIndex = Math.floor(Math.random() * response.images.length);
  const randomImage = response.images[randomIndex];

  console.log("Random Image ID:", randomImage.id);
  return randomImage.id;
}


function generate(interaction)
{
    nsfww = interaction.options.getBoolean('nsfw');
    tagss = interaction.options.getString('query');
    skips = interaction.options.getString('skips');
    if (nsfww == undefined) { nsfww = false };
    if (skips == undefined) { skips = 0 };

    axios.post(
      "https://nekos.moe/api/v1/images/search",
      {
          httpsAgent: proxyAgent,
          nsfw: nsfww,
          limit: 800,
          skip: skips,
          tags: "\"" + tagss + "\"",
          sort: "newest",
          artist: "",
          uploader: ""
      },
      {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
              "Accept": "application/json, text/plain, */*",
              "Accept-Language": "en-US,en;q=0.5",
              "Content-Type": "application/json;charset=utf-8",
              "Authorization": "null",
              "Sec-Fetch-Dest": "empty",
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Site": "same-origin",
              "Pragma": "no-cache",
              "Cache-Control": "no-cache"
          },
          withCredentials: true
      }
  )
  .then(async response => {
      console.log(response.data);
      //const ID = response.data.images[0].id;
      const ID = getRandomImageId(response.data);
      await interaction.reply("https://nekos.moe/image/" + ID);
    //await getImage(ID);
  })
  .catch(error => {
      console.error("Error fetching data:", error);
  });
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nekosearch')
		.setDescription('Search neko image from database')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('search query')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('nsfw')
                .setDescription('not safe for work')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('skips')
                .setDescription('page num')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		await generate(interaction);
	},
};


