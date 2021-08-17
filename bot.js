require("dotenv").config();
const readAliasFile = require("./JSONParser");
const registerUser = require("./registerUser");
const unRegisterUser = require("./unRegisterUser");
const createTeam = require("./createTeam");
const removeTeam = require("./removeTeam");
const addPlayerToTeam = require("./addPlayerToTeam");
const removePlayerFromTeam = require("./removePlayerFromTeam");
const embed = require("./embed");
const Discord = require("discord.js");
const {
    Client,
    Intents
} = require("discord.js");

const filePath = process.env.ALIASES_FILEPATH;
const BOT_ID = process.env.BOT_ID;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const PREFIX = "!";
const MENTION = "@"


// When bot logs in and is "ready"
client.on("ready", () => {
    console.log("We Are LIVE!");
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// when a message is sent on discord, it is checked by this function
client.on("messageCreate", (message) => {
    if (message.author.id === BOT_ID) return;
    if (message.content.indexOf(PREFIX) !== 0) return;

    const arguments = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = arguments.shift().toLowerCase();
    const discordId = message.author.id;
    const discordName = message.author.username;

    // to register a player based on discorId and arguments
    if (command === "register") {
        registerUser(filePath, message, arguments, discordId, discordName);
    }

    //unregister player based on discordId
    if (command === "unregister") {
        unRegisterUser(filePath, message, discordId, discordName);
    }

    //create a team
    if (command === "createteam") {
        createTeam(filePath, message, arguments)
    }

    //remove a team
    if (command === "removeteam") {
        removeTeam(filePath, message, arguments)
    }

    if (command === "addplayer") {
        addPlayerToTeam(filePath, message)
    }

    if (command === "removeplayer") {
        removePlayerFromTeam(filePath, message)
    }

    if (command === "rosters") {
        embed(filePath, message)
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

    
});



client.login(process.env.BOT_TOKEN);