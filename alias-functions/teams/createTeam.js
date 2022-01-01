const hf = require("../../helperFunctions");
const fs = require("fs");
const createRole = require("../../discord-functions/createRole");
const em = require("../../discord-functions/generalEmbed");


function createTeam(filePath, message, arguments) {
    let title;
    let uniqueMessage;
    const teamName = arguments.join(" ");
    let teamToBeCreated = {
        [teamName]: []
    }
    hf.readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error)
        } else {
            if (data.teams.hasOwnProperty(teamName)) {
                title = "Team Not Created";
                uniqueMessage = "This team name is already taken or you've already registered it.";
                return em.noActionRequiredEmbed(message, title, uniqueMessage);
                
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
            title = "Team Created!";
            uniqueMessage = `You've added the team ${arguments.join(" ")}, and a new Role for this team was created. \n Players will be given a Team Role when they are added to the roster.`
            return em.successEmbed(message, title, uniqueMessage);
        }
    })
}


module.exports = createTeam;