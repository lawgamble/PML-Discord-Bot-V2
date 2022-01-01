require("dotenv").config();
const fs = require("fs");
const registerUser = require("./alias-functions/users/registerUser");
const unRegisterUser = require("./alias-functions/users/unRegisterUser");
const createTeam = require("./alias-functions/teams/createTeam");
const removeTeam = require("./alias-functions/teams/removeTeam");
const addPlayerToTeam = require("./alias-functions/teams/addPlayerToTeam");
const removePlayerFromTeam = require("./alias-functions/teams/removePlayerFromTeam");
const matchFunction = require("./alias-functions/match-scrim-challenge/matchFunctions");
const scrimFunction = require("./alias-functions/match-scrim-challenge/scrimFunction")
const challengeFunction = require("./alias-functions/match-scrim-challenge/challengeFunction");
const matchScore = require("./alias-functions/match-scrim-challenge/matchScore");
const challengeScore = require("./alias-functions/match-scrim-challenge/challengeScore")
const botRepeat = require("./discord-functions/botRepeat");
const { pickupGame, wipeRedAndBlueTeams, thirtyFiveMinuteTimer, ninetyMinuteTimer } = require("./alias-functions/pickups/pickupGame");
const rosterEmbed = require("./discord-functions/rosterEmbed");
const hf  = require("./helperFunctions")






const teamNewsId = process.env.TEAM_NEWS_ID;

const Discord = require("discord.js");
const {
    Client,
    Intents,
} = require("discord.js");


const filePath = process.env.ALIASES_FILEPATH;
const BOT_ID = process.env.BOT_ID;
const pickupChannelId = process.env.PICKUP_CHANNEL_ID;



const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const PREFIX = "!";



// When bot logs in and is "ready"
client.on("ready", () => {
    hf.readAliasFile(filePath, (error, data) => {
        if (error) {
          console.log(error);
        }
        
        hf.deletePickupTeams(data) 
        hf.clearAllTimeouts()
        hf.writeToAliasFile(data);
    });
    console.log("We Are LIVE!");
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// when a message is sent on discord, it is checked by this function
client.on("messageCreate", (message) => {
    if (message.author.id === BOT_ID) return;
    if (message.channelId === teamNewsId) {
        message.reply("You shouldn't be typing anything in this channel.");
        hf.clearMessages(message, 2);
        return; 
    } 
    if (message.content.indexOf(PREFIX) !== 0) return;

    const arguments = message.content.slice(PREFIX.length).trim().split(/ +/g);

    const command = arguments.shift().toLowerCase();
    const discordAuthorID = message.author.id;
    const discordAuthorUserName = message.author.username;

    switch(command) {
        case "repeat":
            botRepeat(message, arguments);
            break;

        case "register":
            registerUser(filePath, message, arguments, discordAuthorID, discordAuthorUserName);
            break;

        case "unregister":
            unRegisterUser(filePath, message, discordAuthorID, discordAuthorUserName);
            break;
            
        case "createteam":
            if(hf.isLeagueManager()) {
                createTeam(filePath, message, arguments)
            };
            break;
            
        case "removeteam":
            if(hf.isLeagueManager()) {
                removeTeam(filePath, message, arguments)
            }; 
            break;

        case "addplayer":
            if(hf.isCapOrCoCaptain()) {
                addPlayerToTeam(filePath, message)
            }; 
            break;

        case "removeplayer":
            if(hf.isCapOrCoCaptain()) {
                removePlayerFromTeam(filePath, message)
            };
            break;

        case "rosters":
            rosterEmbed(filePath, message);
            break;

        case "matchtime":
            if(hf.isCapOrCoCaptain()) {
                matchFunction(message)
            };
            break;
            
        case "scrimtime":
            if(hf.isCapOrCoCaptain()) {
                scrimFunction(message)
             };
             break;
             
        case "challengetime":
            if(hf.isCapOrCoCaptain()) {
                challengeFunction(message)
             };
             break;
             
        case "matchscore":
            if(hf.isCapOrCoCaptain()) {
                matchScore(message)
             };
             break;
             
        case "challengescore":
            if(hf.isCapOrCoCaptain()) {
                challengeScore(message)
             };
             break;
             
        case "pickup":
            if(hf.msgFromCorrectChannel()) {
                if(message.channel.id === pickupChannelId) { 
                    pickupGame(filePath, message, arguments, command);
                }
                if(message.channel.id === pickupChannel2Id) {
                    pickupGame2(filePath, message, arguments, command);
                }
            };
            break;
            
        case "wipernb":
            wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer);
            break;

        case "wipebng":
            wipeBlackAndGoldTeams(message, filePath, thirtyFiveMinuteTimer2, ninetyMinuteTimer2);
            break;

        default:
            break;
    }
    

    

});

client.login(process.env.BOT_TOKEN);










module.exports = {
    filePath,
}