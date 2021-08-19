const readAliasFile = require("./JSONParser");
const fs = require("fs");
const createRole = require("./createRole")


function createTeam(filePath, message, arguments) {
    const teamName = arguments.join(" ");
    let teamToBeCreated = {
        [teamName]: []
    }
    readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error)
        } else {
            if (data.teams.hasOwnProperty(teamName)) {
                message.reply("This team name is already taken or you've already registered it.")
                return;
            }
            data.teams = {
                ...data.teams,
                ...teamToBeCreated
            };
            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                }
            })
            createRole(message, arguments);
            message.reply(`You've added the team ${arguments.join(" ")}, and a new Role for this team was created. Players will be given a Team Role when they are added to the roster.`)
        }
    })
}


module.exports = createTeam;