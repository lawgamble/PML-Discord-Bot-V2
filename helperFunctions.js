const fs = require("fs");
const filePath = process.env.ALIASES_FILEPATH;
const em = require("./discord-functions/generalEmbed");
const { thirtyFiveMinuteTimer, ninetyMinuteTimer } = require("./alias-functions/pickups/pickupGame");



function deletePickupTeams(data) {
    delete data.teams["RED Team"];
    delete data.teams["BLUE Team"];
    delete data.teams["PICKUP Queue"]
}

function clearAllTimeouts() {
    clearTimeout(thirtyFiveMinuteTimer);
    clearTimeout(ninetyMinuteTimer);
}

function writeToAliasFile(data) {
   return fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
          console.log(error);
        }
      });
}


function isLeagueManager() {
  if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
      return true
  } else {
      em.cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
      return false;
  }
}

function isCapOrCoCaptain() {
  if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
      return true
  } else {
      em.cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
      return false
  }
}
// can add commands to this before the else statement to re-use this function for multiple channels.
function msgFromCorrectChannel() {
  if(command === "pickup") {
      if(message.channel.id === pickupChannelId || message.channel.id === pickupChannel2Id) {
          return true;
      } else {
          em.cautionEmbed(message, "FAILED", `You can only use the pickup game commands in the #pickup-games channel!`);
          return false;
      }
  }
}

function removeTeamRole(message, arguments) {
  const roleToDelete = arguments.join(" ");
  let foundRole = message.guild.roles.cache.find(role => role.name === roleToDelete);
  if(foundRole) {
      foundRole.delete();
  } else {
      message.reply("I wasn't able to delete the Team Role...I guess it's just not my day.")
  }
}

function playerOnAnotherTeam(message, teams, playerName, DiscordName) {
  for (const teamName in teams) {
    const teamWithPlayers = { [teamName]: teams[teamName] };
    if (Object.values(teamWithPlayers).length === 0) continue;
    if (Object.values(teamWithPlayers)[0].includes(playerName)) {
      let title = "No-can-do!";
      let uniqueMessage = `**${DiscordName}** is already on the **${teamName}** roster!`;
      em.cautionEmbed(message, title, uniqueMessage);
      return true;
    }
  }
  return false;
}

function clearMessages(message, numberOfMessagesToBeDeleted) {
  setTimeout(() => {
    message.channel.bulkDelete(numberOfMessagesToBeDeleted);
  }, 3000);
}

function readAliasFile(filePath, callback) {
  fs.readFile(filePath, "utf-8", (error, data) => {
    if (error) {
      return callback && callback(error);
    } else {
      try {
        const aliases = JSON.parse(data);
        return callback && callback(null, aliases);
      } catch (error) {
        return callback && callback(error);
      }
    }
  });
}

const hf = {
  deletePickupTeams,
  clearAllTimeouts,
  writeToAliasFile,
  isLeagueManager,
  isCapOrCoCaptain,
  msgFromCorrectChannel,
  removeTeamRole,
  playerOnAnotherTeam,
  clearMessages,
  readAliasFile
}

module.exports = hf;


