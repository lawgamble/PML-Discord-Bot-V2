const readAliasFile = require("../../JSONParser")
const exec = require("child_process").exec;
const fs = require("fs");
const hf = require("../../helperFunctions");
const em = require("../../discord-functions/generalEmbed");




function wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer) {
    readAliasFile(filePath, (error, data) => {
      if (error) {
        console.log(error);
      }

      removeCapRoles(data, "RED Team" ,message)
      removeCapRoles(data, "BLUE Team", message)

      setTimeout(() => {
        hf.deletePickupTeams(data)

        clearTimeout(thirtyFiveMinuteTimer);
        clearTimeout(ninetyMinuteTimer);

        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
          return em.wipeTeamsEmbed(message, "Teams Wiped: Game Cancelled.");
        });
      }, 500);
    });
  }


  function removeCapRoles(data, team, message) {
    if (data.teams[team]) {
      if (data.teams[team][0]) {
        const teamCaptain = data.teams[team][0];

        const userId = getUserIdByUserName(
          data.players,
          teamCaptain
        );
        const foundUser = message.guild.members.fetch(userId);
        role.members.forEach((member) =>
          member.roles.remove(pickupCaptainRoleId)
        );
      }
    }
  }

    // run when someone runs start or auto start happens
    function restartOtherBot() {
        exec(botRebootCommand, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
        });
      }

      function getUserIdByUserName(players, userName) {
        return Object.keys(players).find(key => players[key] === userName);
      }


      const phf = {
        wipeRedAndBlueTeams,
        removeCapRoles,
        restartOtherBot,
        getUserIdByUserName
      }

      module.exports = phf;