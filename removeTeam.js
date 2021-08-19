const readAliasFile = require("./JSONParser");
const fs = require("fs");
const deleteRole = require("./deleteRole")


function removeTeam(filePath, message, arguments) {
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
                    message.reply(
                        `The team: **${teamToBeRemoved}** has been removed.`
                    );
                    return;
                });
                deleteRole(message, arguments);
            } else {
                if (arguments.length === 0) {
                    message.reply("Please enter a team to be removed. Example: **!removeteam <teamName>**")
                } else {
                    message.reply(`The team name **${teamToBeRemoved}** was not removed because it's currently not an active team. Check spelling and casing errors.`);
                }
            }
        }
    });
}


module.exports = removeTeam;