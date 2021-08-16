const readAliasFile = require("./JSONParser");
const fs = require("fs");

const PREFIX = "!";


function removePlayerFromTeam(filePath, message) {
    const arguments = message.content.slice(PREFIX.length, message.content.indexOf("@") - 1).trim().split(/ +/g);
    const remove = arguments.shift();
    const teamName = arguments.join(" ")

    const userMentionedIds = message.mentions.users.map((user) => user.id);
    const userMentionedNames = message.mentions.users.map((user) => user.username);

    let deletedArray = [];
    let notDeletedArray = [];
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
                    const playerToBeDeleted = data.players[id];
                    const teamArray = data.teams[teamName];
                    let deleteIndex = teamArray.indexOf(playerToBeDeleted)
                    if (teamArray.includes(playerToBeDeleted)) {
                        deletedArray.push(userMentionedNames[index]);
                        teamArray.splice(deleteIndex, 1);
                    } else {
                        notDeletedArray.push(userMentionedNames[index]);
                    }
                })
            }
            if(deletedArray.length === 0 && notDeletedArray.length === 0) {
                message.reply("The members you gave to be deleted aren't actually on this team!")
            }
            if(deletedArray.length > 0 && notDeletedArray.length > 0) {
                message.reply(`These players were deleted from the team **${teamName}**: ${deletedArray.join(", ")}. Player(s) **${notDeletedArray.join(", ")}** weren't actually registered, therefore aren't on any team! `)
            }
            if(deletedArray.length > 0 && notDeletedArray.length === 0) {
                message.reply(`These players have been deleted from the team **${teamName}**: ${deletedArray.join(", ")}.`)
            }
            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                }
            })

        }
    })
}


module.exports = removePlayerFromTeam;