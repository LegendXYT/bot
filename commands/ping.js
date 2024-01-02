import { client } from '../index.js';

export default {
    name: "ping",
    description: 'See the bot\'s ping: latency and api latency',
    accessibility: 'Everyone',
    aliases: [],
    async execute(message, args){
    const resultMessage = await message.channel.send('Calculating ping...')
    const botLatency = resultMessage.createdTimestamp - message.createdTimestamp
    const apiLatency = Math.round(client.ws.ping);
    resultMessage.edit(`Pong! :ping_pong:\nLatency: \`${botLatency}ms\`\nAPI Latency: \`${apiLatency}ms\``);      
}
}