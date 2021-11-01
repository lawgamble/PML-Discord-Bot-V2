const readAliasFile = require("../alias-functions/JSONParser");
const fs = require("fs");
const { successEmbed } = require("../discord-functions/generalEmbed");
const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;

function getUserIdByUserName(players, userName) {
  return Object.keys(players).find((key) => players[key] === userName);
}

function wipeRedAndBlueTeam(message, filePath) {
  const role = message.guild.roles.cache.find(
    (role) => role.id === pickupCaptainRoleId
  );

  readAliasFile(filePath, (error, data) => {
    if (error) {
      console.log(error);
    }

    if (data.teams["RED Team"]) {
      if (data.teams["RED Team"][0]) {
        const redTeamCaptain = data.teams["RED Team"][0];

        const redTeamCaptainUserId = getUserIdByUserName(
          data.players,
          redTeamCaptain
        );
        // remove captainRoleId from redTeamCaptainId
        const foundUser = message.guild.members.fetch(redTeamCaptainUserId);
        role.members.forEach((member) =>
          member.roles.remove(pickupCaptainRoleId)
        );
      }
    }
    if (data.teams["BLUE Team"]) {
      if (data.teams["BLUE Team"][0]) {
        const blueTeamCaptain = data.teams["BLUE Team"][0];

        const blueTeamCaptainUserId = getUserIdByUserName(
          data.players,
          blueTeamCaptain
        );

        // remove captainRoleId from blueTeamCaptainId
        const foundUser = message.guild.members.fetch(blueTeamCaptainUserId);
        role.members.forEach((member) =>
          member.roles.remove(pickupCaptainRoleId)
        );
      }
    }
    setTimeout(() => {
      delete data.teams["RED Team"];
      delete data.teams["BLUE Team"];

      fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
          console.log(error);
        }
        return successEmbed(
          message,
          "Teams Wiped",
          "Red and Blue Teams were removed."
        );
      });
    }, 500);
  });
}

module.exports = wipeRedAndBlueTeam;
