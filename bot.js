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
const rosterEmbed = require("./discord-functions/rosterEmbed");
const pickupGame = require("./alias-functions/pickups/pickupRefactor.js");
const { clearVotesData, checkVoteCount, voter, clearUserVotes }= require("./alias-functions/pickups/voter.js");
const hf  = require("./helperFunctions")
const phf = require("./alias-functions/pickups/pickupHelperFunctions")
var CronJob = require('cron').CronJob;




const PREFIX = "!";
const teamNewsId = process.env.TEAM_NEWS_ID;
const filePath = process.env.ALIASES_FILEPATH;
const voterFilePath = process.env.VOTER_FILEPATH;
const BOT_ID = process.env.BOT_ID;



const {
    Client,
    Intents,
} = require("discord.js");


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});


// When bot logs in 
client.on("ready", () => {
    const data =  hf.readAliasData(filePath);
    hf.writeAliasesData("backup.json", data);

    hf.readAliasFile(filePath, (error, data) => {
        if (error) {
          console.log(error);
        }
        hf.deletePickupTeams(data); 
        hf.writeToAliasFile(data);

    });
    console.log("We Are LIVE!");

    //create a cron job that runs every hour to copy aliases.js file to backup.js file
    new CronJob('0 0 * * *', function() {
       const data =  hf.readAliasData(filePath)
       hf.writeAliasesData("backup.json", data);
    }).start();
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
            if(hf.isLeagueManager(message, command)) {
                createTeam(filePath, message, arguments)
            };
            break;
            
        case "removeteam":
            if(hf.isLeagueManager(message, command)) {
                removeTeam(filePath, message, arguments)
            }; 
            break;

        case "addplayer":
            if(hf.isCapOrCoCaptain(message, command)) {
                addPlayerToTeam(filePath, message)
            }; 
            break;

        case "removeplayer":
            if(hf.isCapOrCoCaptain(message, command)) {
                removePlayerFromTeam(filePath, message)
            };
            break;

        case "rosters":
            rosterEmbed(filePath, message);
            break;

        case "matchtime":
            if(hf.isCapOrCoCaptain(message, command)) {
                matchFunction(message)
            };
            break;
            
        case "scrimtime":
            if(hf.isCapOrCoCaptain(message, command)) {
                scrimFunction(message)
             };
             break;
             
        case "challengetime":
            if(hf.isCapOrCoCaptain(message, command)) {
                challengeFunction(message)
             };
             break;
             
        case "matchscore":
            if(hf.isCapOrCoCaptain(message, command)) {
                matchScore(message)
             };
             break;
             
        case "challengescore":
            if(hf.isCapOrCoCaptain(message, command)) {
                challengeScore(message)
             };
             break;
             
        case "pickup":
            if(hf.msgFromPickupChannel(message)) {
                    pickupGame(message, arguments, command);
            };
            break;
            
        case "wipernb":
            pg.wipeRedAndBlueTeams(message, filePath, pg.thirtyFiveMinuteTimer, pg.ninetyMinuteTimer, command);
            break;

        case "deletemsg" :
            hf.msgDeleter(message, arguments[0]);    
            break;

        case"clearvotes":
            clearVotesData();
            break;

        case"votes":
            checkVoteCount(message);
            break;

        default:
            break;
    }
});


// logs in the bot
client.login(process.env.BOT_TOKEN);

module.exports = {
    filePath
}