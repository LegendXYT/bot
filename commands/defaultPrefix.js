import {
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import { db, commandPrefix} from '../index.js';
import { colours } from '../colours.js';

export default {
    name: "defaultprefix",
    description: 'Set the prefix back to default',
    accessibility: 'Admin',
    aliases: ["default-prefix", "dp"], 
    async execute(message){
    if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send("You do not have permission to execute this command!");
                
    const defaultPrefix = commandPrefix;
    await db.set(`prefix_${message.guild.id}`, defaultPrefix);
    
    const defaultPrefixEmbed = new EmbedBuilder()
        .setColor(colours.blueColour)
        .setDescription(`:white_check_mark:  Your prefix has been changed to **${defaultPrefix}**`)
    
    message.channel.send({embeds: [defaultPrefixEmbed]});  
}
}
