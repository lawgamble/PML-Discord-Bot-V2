const readAliasFile = require("./JSONParser");
const fs = require("fs");
const playerOnAnotherTeam = require("./playerOnAnotherTeam.js")

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

            const teamsListData = data.teams;
            const playersListData = data.players;

            // If teamName doesn't exist
            if (!teamsListData.hasOwnProperty(teamName)) {
                message.reply(`The team name **${teamName}** doesn't exist. This is **case sensitive**, so check spelling and casing.`)
                return;
            }
            // if team name exists
            if (teamsListData.hasOwnProperty(teamName)) {

                userMentionedIds.forEach((id, index) => {
                    //if player is registered
                    if (playersListData.hasOwnProperty(id) && !playerOnAnotherTeam(message, teamsListData, playersListData[id], userMentionedNames[index])) {
                        registeredArray.push(userMentionedNames[index])
                        teamsListData[teamName].push(playersListData[id])
                    } else {
                        notRegisteredArray.push(userMentionedNames[index]);
                    }

                })
            }
            teamsListData[teamName] = [...new Set(teamsListData[teamName])];
        
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
            message.reply(`Player(s): **${notRegisteredArray.join(', ')}** were not added to the **${teamName}** because they are either already on your/another roster OR have not registered! Check previous reply for confirmation.`)
        } 
    })
}

module.exports = addPlayerToTeam;


