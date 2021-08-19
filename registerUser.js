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

            let teamsListData = data.teams;
            let playersListData = data.players;

            //if player is already in players list
            if (playersListData.hasOwnProperty(discordId)) {

                // removes "q-" from old player name and stores its value to use in unique msg response
                const priorPlayerName = playersListData[discordId].slice(2)
                uniqueMessage = `You were already registered, so we just updated your name from: **${priorPlayerName}** to **${arguments.join(" ")}**`
            } else {
                uniqueMessage = `Thanks, ${discordName}! You've registered as **${arguments.join(" ")}**. If you need to change your in-game name, just re-register with the correct name.`;
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
                    message.reply(uniqueMessage)
                }
            })
        }
    })
}

module.exports = registerUser;