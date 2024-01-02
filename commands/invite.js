import { client } from "../index.js"
import { colours } from "../colours.js"

export default {
    name: "invite",
    description: 'Invite me to your server!',
    accessibility: 'Everyone',
    aliases: [],
    execute(message, args){
    const inviteEmbed = new EmbedBuilder()
            .setColor(colours.blueColour)
            .setAuthor({name: `${client.user.username}`, iconURL: client.user.displayAvatarURL()})
            .setDescription('[Invite me to your server!](https://discord.com/api/oauth2/authorize?client_id=581317940323024899&permissions=535800840129&scope=bot%20applications.commands)')
            .setTimestamp()
            message.channel.send({embeds: [inviteEmbed]})
}
}
