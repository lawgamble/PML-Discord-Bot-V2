const readAliasFile = require("../../JSONParser")
const exec = require("child_process").exec;
const fs = require("fs");
const hf = require("../../helperFunctions");
const em = require("../../discord-functions/generalEmbed");
const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;
const botRebootCommand = process.env.BOT_REBOOT_COMMAND;





function wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer, command) {
    readAliasFile(filePath, (error, data) => {
      if (error) {
        console.log(error);
      }

      // if(command !== "undefined") {
      //   if(playersOnTeams(data)) {
      //     return em.simpleReplyEmbed(message, "You can't run this command while players are on teams");
      //   }
      // }
      
        removeCapRoles(data, "RED Team" ,message)
        removeCapRoles(data, "BLUE Team" ,message)
      

      setTimeout(() => {
        deletePickupTeams(data)

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
    if (data.teams[team] && data.teams[team].length > 0) {
      data.teams[team].forEach(player => {
        const userId = getUserIdByUserName(data.players, player);
        const user = message.guild.members.cache.find((member) => member.id === userId);
        if (user) {
          user.roles.remove(pickupCaptainRoleId);
        }
      }); 
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

      function playersOnTeams(data) {
        if(data.teams["RED Team"] && data.teams["RED Team"].length > 0 || data.teams["BLUE Team"] && data.teams["BLUE Team"].length > 0) {
          return true;
        }
      };

      function stopPickupGame(message, ninetyMinuteTimer, thirtyFiveMinuteTimer, gameStarted, filePath, timer) {
        if(message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
          clearTimeout(ninetyMinuteTimer);
          ninetyMinuteTimer = null;
          wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer);
          gameStarted = false;
          timer.stop();
        }
      }

      function deletePickupTeams(data) {
        delete data.teams["RED Team"];
        delete data.teams["BLUE Team"];
        delete data.teams["PICKUP Queue"]
    }


      const phf = {
        wipeRedAndBlueTeams,
        removeCapRoles,
        restartOtherBot,
        getUserIdByUserName,
        stopPickupGame
      }

      module.exports = phf;