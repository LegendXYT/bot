import { agentColours } from '../colours.js';
import { client, db, commandPrefix} from '../index.js';
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} from 'discord.js';
import { Lineups } from '../lineups.js';
import { validSides, kayoValidAbilities as validAbilities, getLineupContent} from '../inputConversion/validData.js';
// TODO fix help command as all are incorrect
export default {
  name: 'kayo',
  description: 'Kayo lineups',
  accessibility: 'Everyone',
  aliases: [],
  async execute(message, args) {
    // Fetch prefix from the database or use a default prefix
    const prefix = (await db.get(`prefix_${message.guild.id}`)) || commandPrefix;

    // Check for valid command arguments
    if (args.length < 1) {
        return message.reply('Please provide a map for Kayo lineups.');
    }

    // Validate map name
    const mapName = Lineups.kayo[args[0].toLowerCase()];
    if (!mapName) {
        const validMaps = Object.keys(Lineups.kayo).map(map => map.charAt(0).toUpperCase() + map.slice(1)).join(', ');
        return message.reply(`Invalid map provided for Kayo lineups. Valid maps: ${validMaps}`);
    }
    const map = args[0].charAt(0).toUpperCase() + args[0].slice(1);

    // Extract and validate ability type
    const abilityType = args[1]?.toLowerCase();
    const checkAbilityType = Object.keys(validAbilities).find(type =>
        validAbilities[type].includes(abilityType)
    );
    if (!checkAbilityType && args[1]) {
        const validUtilities = Object.values(validAbilities)
            .filter(util => util)
            .flatMap(util => util.map(u => u.charAt(0).toUpperCase() + u.slice(1)))
            .join(', ');
        return message.reply(`Invalid utility provided for Kayo lineups. Valid utility: ${validUtilities}`);
    }

    // Extract and validate attack/defense side
    const atk_def = args[2]?.toLowerCase();
    if(!atk_def && args[1]) return message.reply(`pick a side`);
    if (args[2] && !validSides.includes(atk_def.toLowerCase())) {
        const formattedValidSides = validSides.map(side => side.charAt(0).toUpperCase() + side.slice(1));
        return message.reply(`Invalid side provided for Kayo Lineups. Valid sides: ${formattedValidSides.join(', ')}`);
    }
    const location = args.slice(3).join(' ');
    if(!location && args[2]) {
        return message.reply('Please provide a valid location for the lineup.');
    }
    let currentIndex = 0;
    const lineupContent = getLineupContent('kayo', map.charAt(0).toLowerCase() + args[0].slice(1), abilityType, atk_def, args.slice(3).join(' '));
    if (lineupContent && !Array.isArray(lineupContent) ){
        console.log('YAY')
      message.channel.send({ embeds: [createLineupEmbed()]})      
    } else if(lineupContent && Array.isArray(lineupContent)){
        createLineupEmbedForArray()      
    } else {
      if(location && atk_def && checkAbilityType && mapName) return message.reply('Lineup not found.')  
    }
    async function createLineupEmbedForArray(){
        const embed = []
        for(let i=0; i <lineupContent.length; i++){
        const currentLineup = lineupContent[i]
        const lineupEmbed = new EmbedBuilder()
        .setColor(agentColours.kayoColour)
        .setAuthor({ name: currentLineup.title, iconURL: currentLineup.icon})
        // .setDescription("`" + prefix + "video LINEUP_ID` - to display a 1080p mp4 video\nLineup ID can be found in bottom left hand corner")
        .setThumbnail(currentLineup.imageShowcase)
        if(currentLineup.vctCert){
            lineupEmbed.addFields({name: "<:VCT:1088973066039730238> VCT CERTIFIED", value: " ", inline: true})
        }
        lineupEmbed
        .addFields([
            { name: 'Rating:', value: currentLineup.rating, inline: true },
            { name: 'Difficulty:', value: currentLineup.difficulty, inline: true},
            { name: 'Notes:', value: currentLineup.notes },
          ])
        .setImage(currentLineup.gif)
        .setTimestamp()
        .setFooter({ text: `ID: ${currentLineup.lineupId}`, iconURL: 'https://static.wikia.nocookie.net/valorant/images/f/f0/KAYO_icon.png/revision/latest?cb=20210622225019'})
        embed.push(lineupEmbed)
        }
       const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`prev`)
            .setLabel(`Previous`)
            .setStyle(ButtonStyle.Success),
        
            new ButtonBuilder()
            .setCustomId(`next`)
            .setLabel(`Next`)
            .setStyle(ButtonStyle.Primary),
        )
        await message.channel.send({embeds: [embed[currentIndex]], components: [button]}).then(async (msg) => {
            let collector = await msg.createMessageComponentCollector();
             collector.on('collect', async (i) => {
               if(i.customId === 'prev'){
                   currentIndex = (currentIndex - 1 + lineupContent.length) % lineupContent.length;
                    i.update({embeds: [embed[currentIndex]], components: [button]});
                }
               else if(i.customId === 'next'){
                currentIndex = (currentIndex + 1) % lineupContent.length;
                i.update({embeds: [embed[currentIndex]], components: [button]});

            }    
              })
           })
        return embed
    }
    function createLineupEmbed(){
        const lineupEmbed = new EmbedBuilder()
        .setColor(agentColours.kayoColour)
        .setAuthor({ name: lineupContent.title, iconURL: lineupContent.icon})
        // .setDescription("`" + prefix + "video LINEUP_ID` - to display a 1080p mp4 video\nLineup ID can be found in bottom left hand corner")
        .setThumbnail(lineupContent.imageShowcase)
        if(lineupContent.vctCert){
            lineupEmbed.addFields({name: "<:VCT:1088973066039730238> VCT CERTIFIED", value: " ", inline: true})
        }
        lineupEmbed
        .addFields([
            { name: 'Rating:', value: lineupContent.rating, inline: true },
            { name: 'Difficulty:', value: lineupContent.difficulty, inline: true},
            { name: 'Notes:', value: lineupContent.notes },
          ])
        .setImage(lineupContent.gif)
        .setTimestamp()
        .setFooter({ text: `ID: ${lineupContent.lineupId}`, iconURL: 'https://static.wikia.nocookie.net/valorant/images/f/f0/KAYO_icon.png/revision/latest?cb=20210622225019'})  
        return lineupEmbed
    }
    const createKayoHelpEmbed = (title, fields) => {
        return new EmbedBuilder()
            .setColor(agentColours.kayoColour)
            .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setTitle(title)
            .addFields(fields)
            .setFooter({ text: `Requested by: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
    };
    const embeds = {
        kayoAscentMainPage: createKayoHelpEmbed(
            `Kayo Lineups Ascent`,
            [
                { name: "Defending", value: "> Knife information\n> Defence Flash", inline: true },
                { name: "Attacking", value: "> Knife information\n> Molly Executes\n> Flash Executes", inline: true },
                { name: "Post Plant", value: "> Post Plant Flashes", inline: true },
                { name: "Other", value: "> Other handy lineups", inline: true },
            ]
        ),
    
        kayoAscentAttackPage: createKayoHelpEmbed(
            'Kayo Ascent Attack Lineups',
            [
                { name: "Knife Lineups A site", value: `${prefix}kayo ascent knife attack wine\n${prefix}kayo ascent knife a close site\n${prefix}kayo ascent knife attack a site`, inline: true },
                { name: "Knife Lineups Mid", value: `${prefix}kayo ascent knife attack market`, inline: true },
                { name: "Flash Lineups A site", value: `${prefix}kayo ascent flash attack a site\n${prefix}kayo ascent flash a generator\n${prefix}kayo ascent flash a tree\n${prefix}kayo ascent flash attack a main`, inline: true },
                { name: "Flash Lineups B site", value: `${prefix}kayo ascent flash a site\n${prefix}kayo ascent flash generator\n${prefix}kayo ascent flash tree\n${prefix}kayo ascent flash a main attack`, inline: true },
                { name: "Molly Lineups A site", value: `${prefix}kayo ascent molly heaven\n${prefix}kayo ascent molly dice\n${prefix}kayo ascent molly generator\n${prefix}kayo ascent molly tree`, inline: true },
                { name: "Molly Lineups B site", value: `${prefix}kayo ascent molly stairs\n${prefix}kayo ascent molly ct`, inline: true }
            ]
        ),
    
        kayoAscentDefencePage: createKayoHelpEmbed(
            'Kayo Ascent Defence Lineups',
            [
                { name: "Knife Lineups", value: `${prefix}kayo ascent knife defence a main\n${prefix}kayo ascent knife defence b main`, inline: true },
                { name: "Flash Lineups", value: `${prefix}kayo ascent flash defence b main\n${prefix}kayo ascent flash defence tiles\n${prefix}kayo ascent flash defence b support\n${prefix}kayo ascent flash defence a main\n${prefix}kayo ascent flash defence mid`, inline: true },
            ]
        ),
    
        kayoAscentPostPlantPage: createKayoHelpEmbed(
            'Kayo Ascent Post Plant Lineups',
            [
                { name: "A site Flashes", value: `${prefix}kayo ascent flash heaven`, inline: true },
                { name: "B site Flashes", value: `${prefix}kayo ascent flash anti retake`, inline: true },
            ]
        ),

        kayoAscentOtherPage: createKayoHelpEmbed(
            'Kayo Ascent other Lineups',
            [
                { name: "Destroy Retake Killjoy ult", value: `${prefix}kayo ascent molly postplant retake kj ult`, inline: true },
                { name: "Destroy Killjoy ult B Site ult", value: `${prefix}kayo ascent molly defence kj ult b site`, inline: true },
            ]
        ),
    }
    
    const createButton = (id, label, style) => {
        return new ButtonBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(style)
    }
    const button = new ActionRowBuilder()
    .addComponents(
        createButton('defending', 'Defending', ButtonStyle.Success),
        createButton('attacking', 'Attacking', ButtonStyle.Success),
        createButton('postPlant', 'Post Plant', ButtonStyle.Primary),
        createButton('other','Other', ButtonStyle.Secondary)
    )
    const searchEmbed = {
        mainPage: `kayo${map}MainPage`,
        kayoDefence: `kayo${map}DefencePage`,
        kayoAttack: `kayo${map}AttackPage`,
        kayoPostPlant: `kayo${map}PostPlantPage`,
        kayoOther: `kayo${map}OtherPage`,
    }
    async function buttonActions(message, embed, button) {
        await message.channel.send({ embeds: [embed], components: [button] }).then(async (msg) => {
            let collector = await msg.createMessageComponentCollector();
            collector.on('collect', async (i) => {
                if(i.customId === 'defending'){
                    await i.update({embeds: [embeds[searchEmbed.kayoDefence]], components: [button]})
                }
                else if(i.customId === 'attacking'){
                    await i.update({embeds: [embeds[searchEmbed.kayoAttack]], components: [button]})
                } else if(i.customId === 'postPlant'){
                    await i.update({embeds: [embeds[searchEmbed.kayoPostPlant]], components: [button]})
                } else if(i.customId === 'other'){
                    await i.update({embeds: [embeds[searchEmbed.kayoOther]], components: [button]})
                }
            });
        });
    }
    if (args[0] && !lineupContent) {
        await buttonActions(message, embeds[searchEmbed.mainPage], button);
    } 
  },
};  

