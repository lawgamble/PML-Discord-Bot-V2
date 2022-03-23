const readAliasFile = require("./JSONParser");
const fs = require("fs");


function createTeam(filePath, message, arguments) {
    const teamName = arguments.join(" ");
    let teamToBeCreated = {[teamName] : []}
    readAliasFile(filePath, (error, data) => {
        if(error) {
            console.log(error)
        } else {
            if(data.teams.hasOwnProperty(teamName)) {
                message.reply("This team name is already taken or you've already registered it.")
                return;
            }
            data.teams = {...data.teams, ...teamToBeCreated };
            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if(error) {
                    console.log(error)
                } 
            })
            message.reply(`You've added the team ${arguments.join(" ")}`)
        }
    })
}


module.exports = createTeam;