const readAliasFile = require("./JSONParser");
const fs = require("fs");


function registerUser(filePath, message, arguments, discordId, discordName) {
    if (arguments.length === 0) {
        return message.reply(
            "**CAUTION:** You must enter a valid, case-sensitive in game name when registering! Try again, like this: **!register <in-game-name>**"
        );
    }
    const playerToBeRegistered = {
        [discordId]: "q-" + arguments.join(" ")
    };

    readAliasFile(filePath, (error, data) => {
        let uniqueMessage;

        // if player is re-registering
        if (error) {
            console.log(error)
        } else {
            if (data.players.hasOwnProperty(discordId)) {
                const priorPlayerName = data.players[discordId];
                uniqueMessage = `You were already registered, so we just updated your name from: **${priorPlayerName}** to **${arguments.join(" ")}**`
            } else {
                uniqueMessage = `Thanks, ${discordName}! You've registered as **${arguments.join(" ")}**. If you need to change your in-game name, just re-register with the correct name.`
            }
            const teamsObject = data.teams;
            const previousPlayerName = "q-" + data.players[discordId];
            for(property in teamsObject) {
              let teamList = teamsObject[property];
              if(teamList.includes(previousPlayerName)) {
                  let index = teamList.indexOf(previousPlayerName)
                  teamList.splice(index, 1, playerToBeRegistered)
              }
            }

            data.players = {
                ...data.players,
                ...playerToBeRegistered
            }

            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                } else {
                    message.reply(uniqueMessage)
                }
            })
        }
    })
}

module.exports = registerUser;