import { client } from "../index.js";

export default {
    name: "uptime",
    description: 'See how long the bot has been online for',
    accessibility: 'Everyone',
    aliases: [],
    execute(message, args){
    function duration(ms) {
        const seconds = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
        const minutes = Math.floor((ms / (1000 * 60)) % 60).toString().padStart(2, '0');
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        const days = Math.floor(ms / (1000 * 60 * 60 * 24)).toString().padStart(1, '0');

        if (days === '0' && hours === '00' && minutes === '00') return `**${seconds}** seconds`;
        else if (days === '0' && hours === '00') return `**${minutes}** minutes, **${seconds}** seconds`;
        else if (days === '0') return `**${hours}** hours, **${minutes}** minutes, **${seconds}** seconds`;
        else return `**${days}** days, **${hours}** hours, **${minutes}** minutes, **${seconds}** seconds`;
    }          
    message.channel.send(`I have been on online for: ${duration(client.uptime)}`)    
}
}
