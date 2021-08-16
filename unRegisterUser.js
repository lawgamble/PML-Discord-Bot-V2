const readAliasFile = require("./JSONParser");
const fs = require("fs");

function unRegisterUser(filePath, message, discordId, discordName) {
  readAliasFile(filePath, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      if (data.players.hasOwnProperty(discordId)) {
        const teamsObject = data.teams;
        const previousPlayerName = data.players[discordId];
        for (property in teamsObject) {
          let teamList = teamsObject[property];
          if (teamList.includes(previousPlayerName)) {
            let index = teamList.indexOf(previousPlayerName);
            teamList.splice(index, 1);
          }
        }

        delete data.players[discordId];
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
          message.reply(
            `Sorry to see you go, **${discordName}**. You can always re-register at any time!`
          );
        });
      } else {
        message.reply(
          "You're not actually registered, so there's no need to un-register you!"
        );
      }
    }
  });
}

module.exports = unRegisterUser;
