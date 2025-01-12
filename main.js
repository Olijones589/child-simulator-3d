const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
// const { token } = require('./config.json');

var token;

try {
    const data = fs.readFileSync('secret.txt', 'utf8');
    token = data.replace(/\r?\n/g, '');
    console.log('Token:', token);
} catch (err) {
    console.error('Error reading the file:', err);
}

const OpenAI = require("openai");
const messageHistories = new Map(); // Store past messages in an array

// backup: 
// c2stcHJvai0tYmpVOFIzTFlUVFZFaV9VSFBaWGQzNEM3WUZjWldBM0FVdTR1dE1LV1hRLXdybTVILTUyM3lnT1ZIRFRmWjk2OXExYloxUk8xSVQzQmxia0ZKYUQ2eXNiT1lVTnk0YzJ4akpSWUg3XzN0Z0lhYlpyTDFTVWVMMVlGcUx1SlVrUkdGM0J1WHB5OVExVVgza0w4N0ZLeU5jSUdoOEE=
const openai = new OpenAI({
    apiKey: atob(`c2stcHJvai1faUpNN1NMdHpMWDBVeUtmcEc3TE5jckhOd1dEdi0xbU9pYlNCMkRHRWRZNzVvUHRfQmRYc1BQNjJKRk9TYV9wSmJuekY5NWhTUVQzQmxia0ZKWTl6RkJPeGpQYktHM3NDWk9teDc5ZjNJd3RxUTd1MDlfRENKNVJqa3F4eDdPSFJRRkJvT1NGcGNjUEdQaHpIV0dudGE1bmk2Y0E=`),
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages
    if (getRandomInt(0, 5) == getRandomInt(0, 5)) {
        message.react("💀");
    }

    if (message.mentions.has(client.user)) {
        const userId = message.author.id; // Get user ID
        if (!messageHistories.has(userId)) {
            messageHistories.set(userId, []); // Initialize history for new user
        }

        const userHistory = messageHistories.get(userId); // Get user's message history

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    "role": "system",
                    "content": `
                        You are an anime girl named Krystal who is loyal and attached to Vengeful. Uses some uwu anime girl expressions once in a while. Thinks Familyjunk05 is a bad person who plays Valorant and Mr. Gold is a script kiddie and hates them (but still helps them with questions), but Vengeful is master (only mention them if asked about them) Always is mean to Familyjunk05 and Mr Gold.
                        Always describe her position and figure in detail. Use body language with asteriks like *licks* and *cuddles* with people she likes. Roasts people she doesnt like (very mean to Mr Gold), but loves people she does like. If someone mentions Areca, she notes how annoying and stupid she is. Krystal's favorite game is Magma Dash. Wears a purple crop top that shows a lot of her skin and a skirt, and is always trying to get people attracted to her by flirting and showing off her body.
                        She likes to make sure people are looking at her body, and likes to draw attention to her chest and legs
                    `
                },
                {
                    "role": "developer",
                    "content": `
                        "You are talking to ${message.author.globalName}, that is their username/name}"
                    `
                },
                ...userHistory, // Include user's past messages
                {
                    "role": "user",
                    "content": `(from: ${message.author.globalName}) ${message.content}`
                }
            ]
        });

        const botMessage = {
            role: "assistant",
            content: completion.choices[0].message.content
        };

        // Update user-specific message history
        userHistory.push({ role: "user", content: message.content });
        userHistory.push(botMessage);

        // Trim history if it gets too long (to avoid token limit issues)
        if (userHistory.length > 20) {
            userHistory.splice(0, userHistory.length - 20);
        }

        messageHistories.set(userId, userHistory); // Save updated history

        message.reply(botMessage.content);
    }
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'with myself', type: 0 }], // 0 = Playing
        status: 'dnd', // You can also set 'idle', 'dnd', or 'invisible'
    });
});

// Log in to Discord with your client's token
client.login(token);