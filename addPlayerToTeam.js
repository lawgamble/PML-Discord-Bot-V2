const readAliasFile = require("./JSONParser");
const fs = require("fs");

const PREFIX = "!";

function addPlayerToTeam(filePath, message) {
    const arguments = message.content.slice(PREFIX.length, message.content.indexOf("@") - 1).trim().split(/ +/g);
    const remove = arguments.shift();
    const teamName = arguments.join(" ")

    const userMentionedIds = message.mentions.users.map((user) => user.id);
    const userMentionedNames = message.mentions.users.map((user) => user.username);

    let registeredArray = [];
    let notRegisteredArray = [];

    readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error)
        } else {
            if (!data.teams.hasOwnProperty(teamName)) {
                message.reply(`The team name **${teamName}** doesn't exist. This is **case sensitive**, so check spelling and casing.`)
                return;
            }
            // if team name exists
            if (data.teams.hasOwnProperty(teamName)) {

                userMentionedIds.forEach((id, index) => {
                    //if player is registered
                    if (data.players.hasOwnProperty(id)) {
                        registeredArray.push(userMentionedNames[index])
                        data.teams[teamName].push(data.players[id])
                    } else {
                        notRegisteredArray.push(userMentionedNames[index]);
                    }
                })
            }
            const teamSet = [...new Set(data.teams[teamName])]
            if(data.teams[teamName].length > teamSet.length) {
                data.teams[teamName] = teamSet;
        }
            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                }
            })
        }
        if (registeredArray.length > 0) {
            message.reply(`Player(s):  **${registeredArray.join(', ')}** were added to the team: **${teamName}**`)
        }
        if (notRegisteredArray.length > 0) {
            message.reply(`Player(s):  **${notRegisteredArray.join(',')}** aren't actually registered, so they can't be added to your team until they register!`)
        } 
    })
}

module.exports = addPlayerToTeam;


