
const fs = require("fs");
const em = require("../../discord-functions/generalEmbed");
const hf = require("../../helperFunctions");


function removeTeam(filePath, message, arguments) {
    let title;
    let uniqueMessage;
    const teamToBeRemoved = arguments.join(" ");

    hf.readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            if (data.teams.hasOwnProperty(teamToBeRemoved)) {

                delete data.teams[teamToBeRemoved];

                fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
                    if (error) {
                        console.log(error);
                    }
                });
                title = "Team Removed"
                uniqueMessage = `The team: **${teamToBeRemoved}** has been removed.`;
                em.successEmbed(message, title, uniqueMessage);

                hf.removeTeamRole(message, arguments);
            } else {
                if (arguments.length === 0) {
                    title = "Caution";
                    uniqueMessage = "Please enter a team to be removed. Example: \n **!removeteam <teamName>**";
                    em.cautionEmbed(message, title, uniqueMessage);
                } else {
                    title = "Caution";
                    uniqueMessage = `The team name **${teamToBeRemoved}** was not removed because it's currently not an active team. Check spelling and casing errors.`;
                    em.cautionEmbed(message, title, uniqueMessage);
                }
            }
        }
    });
}




module.exports = removeTeam;