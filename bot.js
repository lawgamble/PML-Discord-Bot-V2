require("dotenv").config();
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
const connectToServer = require("./rcon-functions/rconCommands");
const { cautionEmbed } = require("./discord-functions/generalEmbed");
const server = require("./serverCreds");

const rosterEmbed = require("./discord-functions/rosterEmbed");
const pgClient = require("./db/pg")
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


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const PREFIX = "!";



// When bot logs in and is "ready"
client.on("ready", () => {
    console.log("We Are LIVE!");

    //DB connection
    // pgClient.connect(function (err) {
    //     if (err) throw err;
    //     console.log("PostgreSQL DB is connected!");
    //   });
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

    const discordId = message.author.id;
    const discordName = message.author.username;




    if (command === "register") {
        registerUser(filePath, message, arguments, discordId, discordName);
    }


    if (command === "unregister") {
        unRegisterUser(filePath, message, discordId, discordName);
    }


    if (command === "createteam") {
        if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
            createTeam(filePath, message, arguments)
        } else {
            return  cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }


    if (command === "removeteam") {
        if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
            removeTeam(filePath, message, arguments)
        } else {
            return  cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }

    if (command === "addplayer") {
        if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
            addPlayerToTeam(filePath, message)
        } else {
            return  cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }

    if (command === "removeplayer") {
        if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
            removePlayerFromTeam(filePath, message)
        } else {
            return  cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }


    if (command === "rosters") {
        rosterEmbed(filePath, message)

    }

    
    if (command === "matchtime") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
            matchFunction(message)
        } else {
            return cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }
    if (command === "scrimtime") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
           scrimFunction(message)
        } else {
            return cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }
    if (command === "challengetime") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
           challengeFunction(message)
        } else {
            return cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }
    if (command === "matchscore") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
           matchScore(message)
        } else {
            return cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }
    if (command === "challengescore") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
           challengeScore(message)
        } else {
            return cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
        }
    }




    //RCON Commands
    const rconCommandWords = [
        "ban",
        "kick",
        "kill",
        "rotatemap",
        "switchmap",
        "switchteam",
        "inspectplayer",
        "refreshlist",
        "slap",
        "serverinfo",
        "resetsnd",
        "setpin",
      ];

    
    if (rconCommandWords.includes(command)) {
         connectToServer(server, message);
    }
    




   
    



    // to see all of aliases.json file
    if (command === "info-alias") {
        readAliasFile(filePath, (error, aliases) => {
            if (error) {
                return message.reply(`There was an error: ${error}`)
            }
            return message.reply(JSON.stringify(aliases, null, 2))
        })
    }
    // to see list of registered players
    if (command === "info-players") {
        readAliasFile(filePath, (error, aliases) => {
            if (error) {
                return message.reply(`There was an error: ${error}`)
            }
            return message.reply(JSON.stringify(aliases.players, null, 2))
        })
    }

    // to see list of teams and its players
    if (command === "info-teams") {
        readAliasFile(filePath, (error, aliases) => {
            if (error) {
                return message.reply(`There was an error: ${error}`)
            }
            return message.reply(JSON.stringify(aliases.teams, null, 2))
        })
    }


    //DB functions

    if(command === "userstable") {
        message.reply("Users Table PlaceHolder")
    }
});



client.login(process.env.BOT_TOKEN);