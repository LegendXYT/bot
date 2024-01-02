import {
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import { db } from '../index.js';
import { colours } from '../colours.js';

export default {
    name: "setprefix",
    description: 'Customize the bots prefix to your liking',
    accessibility: 'Admin',
    aliases: ["set-prefix", "sp"],
    async execute(message, args){

    if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send("You do not have permission to execute this command!");
    
    const newPrefix = args[0];
    if (!newPrefix) return message.channel.send("Please provide a new prefix!");

    await db.set(`prefix_${message.guild.id}`, newPrefix)

    const setPrefixEmbed = new EmbedBuilder()
    .setColor(colours.blueColour)
    .setDescription(`:white_check_mark:  Your prefix has been changed to **${newPrefix}**`)

    message.channel.send({embeds: [setPrefixEmbed]});
}
}