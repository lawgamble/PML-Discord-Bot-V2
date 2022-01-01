require("dotenv").config();
const fs = require("fs");
const readAliasFile = require("./alias-functions/JSONParser");
const registerUser = require("./alias-functions/registerUser");
const unRegisterUser = require("./alias-functions/unRegisterUser");
const createTeam = require("./alias-functions/createTeam");
const removeTeam = require("./alias-functions/removeTeam");
const addPlayerToTeam = require("./alias-functions/addPlayerToTeam");
const removePlayerFromTeam = require("./alias-functions/removePlayerFromTeam");
const clearMessages = require("./discord-functions/clearMessages");
const matchFunction = require("./alias-functions/matchFunctions");
const scrimFunction = require("./alias-functions/scrimFunction")
const challengeFunction = require("./alias-functions/challengeFunction");
const matchScore = require("./alias-functions/matchScore");
const challengeScore = require("./alias-functions/challengeScore")
const { cautionEmbed } = require("./discord-functions/generalEmbed");
const server = require("./serverCreds");
const botRepeat = require("./discord-functions/botRepeat");
const { pickupGame, wipeRedAndBlueTeams, thirtyFiveMinuteTimer, ninetyMinuteTimer } = require("./alias-functions/pickupGame");
const { pickupGame2, wipeBlackAndGoldTeams, thirtyFiveMinuteTimer2, ninetyMinuteTimer2 } = require("./alias-functions/pickupGame2");
const  hf  = require("./helperFunctions")





const rosterEmbed = require("./discord-functions/rosterEmbed");

const teamNewsId = process.env.TEAM_NEWS_ID;

const Discord = require("discord.js");
const {
    Client,
    Intents,
} = require("discord.js");


const filePath = process.env.ALIASES_FILEPATH;
const BOT_ID = process.env.BOT_ID;
const captainRoleId = process.env.CAPTAIN_ROLE_ID;
const leagueManagerRoleId = process.env.LEAGUE_MANAGER_ROLE_ID;
const coCaptainRoleId = process.env.CO_CAP_ROLE_ID;
const pickupChannelId = process.env.PICKUP_CHANNEL_ID;
const pickupChannel2Id = process.env.PICKUP_CHANNEL2_ID;


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const PREFIX = "!";



// When bot logs in and is "ready"
client.on("ready", () => {
    readAliasFile(filePath, (error, data) => {
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
        clearMessages(message, 2);
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
            if(isLeagueManager()) {
                createTeam(filePath, message, arguments)
            };
            break;
            
        case "removeteam":
            if(isLeagueManager()) {
                removeTeam(filePath, message, arguments)
            }; 
            break;

        case "addplayer":
            if(isCapOrCoCaptain()) {
                addPlayerToTeam(filePath, message)
            }; 
            break;

        case "removeplayer":
            if(isCapOrCoCaptain()) {
                removePlayerFromTeam(filePath, message)
            };
            break;

        case "rosters":
            rosterEmbed(filePath, message);
            break;

        case "matchtime":
            if(isCapOrCoCaptain()) {
                matchFunction(message)
            };
            break;
            
        case "scrimtime":
            if(isCapOrCoCaptain()) {
                scrimFunction(message)
             };
             break;
             
        case "challengetime":
            if(isCapOrCoCaptain()) {
                challengeFunction(message)
             };
             break;
             
        case "matchscore":
            if(isCapOrCoCaptain()) {
                matchScore(message)
             };
             break;
             
        case "challengescore":
            if(isCapOrCoCaptain()) {
                challengeScore(message)
             };
             break;
             
        case "pickup":
            if(msgFromCorrectChannel()) {
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
    

    
    function isLeagueManager() {
        if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
            return true
        } else {
            cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
            return false;
        }
    }
    
    function isCapOrCoCaptain() {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
            return true
        } else {
            cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
            return false
        }
    }
    // can add commands to this before the else statement to re-use this function for multiple channels.
    function msgFromCorrectChannel() {
        if(command === "pickup") {
            if(message.channel.id === pickupChannelId || message.channel.id === pickupChannel2Id) {
                return true;
            } else {
                cautionEmbed(message, "FAILED", `You can only use the pickup game commands in the #pickup-games channel!`);
                return false;
            }
        }
    }
});

client.login(process.env.BOT_TOKEN);










module.exports = {
    filePath,
}