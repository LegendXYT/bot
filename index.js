import dotenv from 'dotenv';
import { QuickDB } from 'quick.db';
import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField,
    ActivityType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
dotenv.config();

// Initializing quickDB, environment variables, and Discord client
export const db = new QuickDB();
export const { TOKEN, botID, guildID, devID } = process.env;
export const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
    ],
  });
// Default command prefix
export const commandPrefix = '!';
// List of command files
const commandFiles = ['help', 'ping', 'uptime', 'setStatus', 'setPrefix', 'defaultPrefix', 'kayo'];
const commands = commandFiles.map(file => import(`./commands/${file}.js`));
client.commands = new Map();

(async () => {
    const commandModules = await Promise.all(commands);

    for (const commandModule of commandModules) {
        const command = commandModule.default; // Access the default export
        client.commands.set(command.name, command);
        // Check if the command has aliases
        if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
                client.commands.set(alias, command);
            }
        }
    }
})();

// Event handler for when the bot is ready
client.on("ready", async (c) => {
    console.log(`
    ${c.user.tag} is online!
    Working on ${client.guilds.cache.size} servers!
    Working with ${client.users.cache.size} users!
    `);
    const statuses = [
      { name: `${commandPrefix}help`, type: ActivityType.Playing },
      { name: "Lineup Tutorials", type: ActivityType.Watching },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Competing },
      { name: `${client.users.cache.size} users`, type: ActivityType.Listening },
    ];

    setInterval(() => {
    let random = Math.floor(Math.random() * statuses.length);
    client.user.setActivity(statuses[random]);
    }, 15000); // time delay between each status (15s) 
});

// Event handler for when a message is created
client.on("messageCreate", async(message) => {
    let prefix = (await db.get(`prefix_${message.guild.id}`)) || commandPrefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // Execute the command if it exists in the commands map
    if (client.commands.has(command)) {
        try {
            const commandToExecute = client.commands.get(command);
            commandToExecute.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while executing the command.');
        }
    }
});

// Log in to Discord with the bot token
client.login(TOKEN);