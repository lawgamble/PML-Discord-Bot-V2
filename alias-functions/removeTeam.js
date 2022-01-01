const readAliasFile = require("./JSONParser");
const fs = require("fs");
const deleteRole = require("../discord-functions/deleteRole");
const { successEmbed, noActionRequiredEmbed, cautionEmbed } = require("../discord-functions/generalEmbed");


function removeTeam(filePath, message, arguments) {
    let title;
    let uniqueMessage;
    const teamToBeRemoved = arguments.join(" ");

    readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            if (data.teams.hasOwnProperty(teamToBeRemoved)) {

                delete data.teams[teamToBeRemoved];

                //write code to remove LP role if team gets removed;


                fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
                    if (error) {
                        console.log(error);
                    }
                });
                title = "Team Removed"
                uniqueMessage = `The team: **${teamToBeRemoved}** has been removed.`;
                successEmbed(message, title, uniqueMessage);
                deleteRole(message, arguments);
            } else {
                if (arguments.length === 0) {
                    title = "Caution";
                    uniqueMessage = "Please enter a team to be removed. Example: \n **!removeteam <teamName>**";
                    cautionEmbed(message, title, uniqueMessage);
                } else {
                    title = "Caution";
                    uniqueMessage = `The team name **${teamToBeRemoved}** was not removed because it's currently not an active team. Check spelling and casing errors.`;
                    cautionEmbed(message, title, uniqueMessage);
                }
            }
        }
    });
}


module.exports = removeTeam;