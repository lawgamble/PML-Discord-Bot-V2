const readAliasFile = require("../../JSONParser");
const fs = require("fs");
const em = require("../../discord-functions/generalEmbed")



function registerUser(filePath, message, arguments, discordId, discordName) {
    let title;
    let uniqueMessage;
     
    if (arguments.length === 0) {
        title = "**CAUTION**"
        uniqueMessage = "You must enter a valid, case-sensitive in game name when registering! Try again, like this:\n**!register <in-game-name>**";
        return em.cautionEmbed(message, title, uniqueMessage);
    }
    const playerToBeRegistered = {
        [discordId]: "q-" + arguments.join(" ")
    };

    readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error)
        } else {
            let teamsListData = data.teams;
            let playersListData = data.players;
            
            if (playersListData.hasOwnProperty(discordId)) {             
                const priorPlayerName = playersListData[discordId].slice(2)
                uniqueMessage = `You were already registered, so we just updated your name from:\n **${priorPlayerName}** \n to **${arguments.join(" ")}**`
            } else {
                uniqueMessage = `Thanks, ${discordName}! You've registered as **${arguments.join(" ")}**. \n If you need to change your in-game name, just re-register with the correct name.`;
            }

            // find player name prior to updating 
            const previousPlayerName =  playersListData[discordId];
            for (property in teamsListData) {

                // single team array
                let teamListIteration = teamsListData[property];
                // if previous name is in team array
                if (teamListIteration.includes(previousPlayerName)) {

                    // find index of previous player name 
                    let index = teamListIteration.indexOf(previousPlayerName)
                    // remove and replace with new name
                    teamListIteration.splice(index, 1, playerToBeRegistered[discordId])
                }
            }

            data.players = {
                ...playersListData,
                ...playerToBeRegistered
            }

            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                } else {
                    title ="Lets Go!"
                    return em.successEmbed(message, title, uniqueMessage)
                }
            })
        }
    })
}

module.exports = registerUser;