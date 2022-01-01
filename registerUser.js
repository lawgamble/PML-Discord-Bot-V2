const readAliasFile = require("./JSONParser");
const fs = require("fs");


function registerUser(filePath, message, arguments, discordId, discordName) {
    if (arguments.length === 0) {
      return message.reply(
        "**CAUTION:** You must enter a valid, case-sensitive in game name when registering! Try again, like this: **!register <in-game-name>**"
      );
    }
    const playerToBeRegistered = {[discordId] : arguments.join(" ")};

    readAliasFile(filePath, (error, data) => {
        let uniqueMessage;
        if(error) {
            console.log(error)
        } else {
            if (data.players.hasOwnProperty(discordId)) {
                 uniqueMessage = `You were already registered, so we just updated your name to: **${arguments.join(" ")}**`
            } else {
                 uniqueMessage = `Thanks, ${discordName}! You've registered as **${arguments.join(" ")}**. If you need to change your in-game name, just re-register with the correct name.`
            }
            data.players = {...data.players, ...playerToBeRegistered}
            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if(error) {
                    console.log(error)
                } else {
                    message.reply(uniqueMessage)
                }
            })
        }
    }) 
  }

  module.exports = registerUser;