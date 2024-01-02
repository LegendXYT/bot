import { colours } from '../colours.js';
import { client, db, commandPrefix } from '../index.js';
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export default {
    name: "help",
    description: 'See all the bots commands, and details about them',
    accessibility: 'Everyone',
    aliases: ["h"],
    async execute(message, args) {
    // Fetching the prefix from the database or using the default prefix
    const prefix = (await db.get(`prefix_${message.guild.id}`)) || commandPrefix;
    const specificCommandName = args[0]
    try {
        const specificCommand = Array.from(client.commands.values()).find(command => {
            return command.name === specificCommandName || (command.aliases && command.aliases.includes(specificCommandName));
        });
        if(specificCommand){
             // Finding the specific command and list their information
            const { name, aliases, description, accessibility} = specificCommand;
            const checkAlias = aliases ? aliases.join(', '): null 
            // changing the information only for the help command
            if(args[0] === 'help'){
                message.channel.send({ embeds: [createFurtherInfoEmbed(name, `${name}\n${prefix}help [command]\n**e.g: ${prefix}help ping**`, description, accessibility, checkAlias)]} )
            } else message.channel.send({ embeds: [createFurtherInfoEmbed(name, name, description, accessibility, checkAlias)]} ) // send embed for everything else
        } else {
            // Logging an error if the specific command is not found
            if(args[0]) console.log(`Command '${specificCommandName}' not found.`);
        }
    } catch (e) {
        // Logging an error if an exception occurs during command execution
        console.error('An error occurred while processing the specific command: ', e)
    }
    // Function to create an embed for a command information
    const createInitialEmbed = (color, title, description, fields) => {
        return new EmbedBuilder()
            .setColor(color)
            .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .addFields(fields)
            .setFooter({ text: `Requested by: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
    };
    // Object containing initial help embed
    const embeds = {
        help: createInitialEmbed(
            colours.lightBlueColour,
            `${client.user.username} Commands`,
            `These are the available commands for ${client.user.username}\nThe bot prefix is: ${prefix}\n**Do** ${prefix}help [Command] **- for further information**`,
            [
                { name: ":gear: Utility", value: "> Util commands", inline: true },
                { name: ":tools: Admin", value: "> Admin commands", inline: true },
                { name: ":nerd: Lineups", value: "> Lineups Commands" },
            ]
        ),
    
        util: createInitialEmbed(
            colours.greenColour,
            'Util Commands',
            `**Do** ${prefix}help [Command] **- for further information**`,
            [
                { name: `${prefix}help`, value: `do ${prefix}help for a list of commands` },
                { name: `${prefix}ping`, value: `do ${prefix}ping to get the bot's ping` },
                { name: `${prefix}uptime`, value: `do ${prefix}uptime to see the bot's uptime` },
                { name: `${prefix}invite`, value: `do ${prefix}invite to invite the bot to your server` },
            ]
        ),
    
        admin: createInitialEmbed(
            colours.greenColour,
            'Administrator Commands',
            `**Do** ${prefix}help [Command] **- for further information**`,
            [
                { name: `${prefix}setprefix`, value: `do ${prefix}setprefix to change the bot's prefix` },
                { name: `${prefix}defaultprefix`, value: `do ${prefix}defaultprefix to see the prefix back to default` },
            ]
        ),
    
        lineups: createInitialEmbed(
            colours.greenColour,
            'Lineup Commands',
            `**Do** ${prefix}help [Command] **- for further information**`,
            [
                { name: `${prefix}video [Lineup ID]`, value: `to view an mp4 file of a lineup`, inline: true },
                { name: `${prefix}lineup [Lineup ID]`, value: `to quickly search a lineup`, inline: true },
                { name: `${prefix}kayo ascent`, value: `to view the Kayo lineups for Ascent`, inline: true },
                { name: `${prefix}viper icebox`, value: `to view the Viper lineups for Icebox`, inline: true },
            ]
        ),
    }
    // function to create interactive buttons
    const createButton = (id, label, style) => {
        return new ButtonBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(style)
    }
    // button information
    const button = new ActionRowBuilder()
    .addComponents(
        createButton('home', '🏠 | Home', ButtonStyle.Secondary),
        createButton('util', '⚙️ | Utility', ButtonStyle.Success),
        createButton('admin', '🛠️ | Admin', ButtonStyle.Success),
        createButton('lineups','🤓 | Lineups', ButtonStyle.Success)
    )
    // button actions when pressed
    async function buttonActions(message, embed, button) {
        await message.channel.send({ embeds: [embed], components: [button] }).then(async (msg) => {
            let collector = await msg.createMessageComponentCollector();
            collector.on('collect', async (i) => {
                if(i.customId === 'home'){
                    await i.update({embeds: [embed], components: [button]})
                }
                else if(i.customId === 'util'){
                    await i.update({embeds: [embeds.util], components: [button]})
                } else if(i.customId === 'admin'){
                    await i.update({embeds: [embeds.admin], components: [button]})
                } else if(i.customId === 'lineups'){
                    await i.update({embeds: [embeds.lineups], components: [button]})
                }
            });
        });
    }
    // if no specific command is requested displays the overall help information
    if (!args[0]) {
        await buttonActions(message, embeds.help, button);
    }
    // Function to create an embed for a specific help command
    function createFurtherInfoEmbed(title, usage, description, accessibility, aliases) {
        const embed = new EmbedBuilder()
            .setColor(colours.greenColour)
            .setTitle(`Command: ${title.charAt(0).toUpperCase()  + title.slice(1)}`)
            .setAuthor({ name: `${client.user.username} help!`, iconURL: client.user.displayAvatarURL() })
            .setThumbnail(message.guild.iconURL())
            .setDescription(`The bot prefix is ${prefix}`)
            .addFields({ name: 'Usage:', value: `${prefix}${usage}`, inline: true })
            .addFields({ name: 'Description:', value: description, inline: true })
            .addFields({ name: 'Accessibility:', value: accessibility, inline: false })
            .setFooter({ text: `Requested by: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        if(aliases) {
            embed.addFields({ name: 'Aliases:', value: aliases, inline: true })    
        }   
        return embed
            .setFooter({ text: `Requested by: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();              
    }          
    }
}