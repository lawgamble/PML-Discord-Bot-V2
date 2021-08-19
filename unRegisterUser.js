const readAliasFile = require("./JSONParser");
const fs = require("fs");
const LeaguePlayerRoleId = process.env.LP_ID;

function unRegisterUser(filePath, message, discordId, discordName) {
  readAliasFile(filePath, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      const playersListData = data.players;
      const teamsListData = data.teams;

      if (playersListData.hasOwnProperty(discordId)) {
        const previousPlayerName = playersListData[discordId];

        for (let teamName in teamsListData) {
          let teamListIteration = teamsListData[teamName];
          if (teamListIteration.includes(previousPlayerName)) {
            let indexOfFoundPlayer =
              teamListIteration.indexOf(previousPlayerName);

            // remove player from team roster array
            teamListIteration.splice(indexOfFoundPlayer, 1);

            // remove team role
            const teamRole = message.guild.roles.cache.find(
              (role) => role.name == teamName
            );
            message.member.roles.remove(teamRole).catch(console.error);
          }
        }

        // delete player from players list
        delete playersListData[discordId];
        // remove league player role
        let LeagueRole = message.guild.roles.cache.get(LeaguePlayerRoleId);
        message.member.roles.remove(LeagueRole).catch(console.error);

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
