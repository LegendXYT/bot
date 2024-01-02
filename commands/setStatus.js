import { client, devID } from '../index.js';

export default {
    name: "setstatus",
    description: 'Change the bots status',
    accessibility: 'Developer',
    aliases: ["set-status"],
    execute(message, args){
    if (message.author.id != devID) return message.channel.send("You are not allowed to use this command!");
            
    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    const requestedStatus = args[0]?.toLowerCase();

    if (!requestedStatus || !validStatuses.includes(requestedStatus)) return message.channel.send(`Invalid status. Please provide one of the following: **${validStatuses.join(', ')}**`);

    client.user.setStatus(requestedStatus);
    message.channel.send(`Successfully changed the bot's status to **${requestedStatus}**`);
}
}