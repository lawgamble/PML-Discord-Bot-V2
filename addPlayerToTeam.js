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
                        message.reply(`Player(s):  **${notRegisteredArray.join(',')}** are currently not officially registered, so they can't be added to your team until they register!`)
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
        } else {
            message.reply(`No players were added to the **${teamName}** because : 1) You may have misspelled the team name. 2) None of the players you tried to add are currently registered.`)
        }
    })
}

module.exports = addPlayerToTeam;


