require("dotenv").config();
const readAliasFile = require("./JSONParser");
const registerUser = require("./registerUser");
const unRegisterUser = require("./unRegisterUser");
const createTeam = require("./createTeam");
const removeTeam = require("./removeTeam");
const addPlayerToTeam = require("./addPlayerToTeam");
const removePlayerFromTeam = require("./removePlayerFromTeam");

const rosterEmbed = require("./rosterEmbed");

const Discord = require("discord.js");
const {
    Client,
    Intents,
} = require("discord.js");

const filePath = process.env.ALIASES_FILEPATH;
const BOT_ID = process.env.BOT_ID;
const captainRoleId = process.env.CAPTAIN_ROLE_ID;
const leagueManagerRoleId = process.env.LEAGUE_MANAGER_ROLE_ID;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const PREFIX = "!";



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
            return message.reply(`You do not have permission to use the **!${command}** command!`)
        }
    }


    if (command === "removeteam") {
        if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
            removeTeam(filePath, message, arguments)
        } else {
            return message.reply(`You do not have permission to use the **!${command}** command!`)
        }
    }

    if (command === "addplayer") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId)) {
            addPlayerToTeam(filePath, message)
        } else {
            return message.reply(`You do not have permission to use the **!${command}** command!`)
        }
    }

    if (command === "removeplayer") {
        if (message.member.roles.cache.find((role) => role.id === captainRoleId)) {
            removePlayerFromTeam(filePath, message)
        } else {
            return message.reply(`You do not have permission to use the **!${command}** command!`)
        }
    }


    if (command === "rosters") {
        rosterEmbed(filePath, message)
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