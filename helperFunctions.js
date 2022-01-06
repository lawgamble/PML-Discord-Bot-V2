const fs = require("fs");
const filePath = process.env.ALIASES_FILEPATH;
const em = require("./discord-functions/generalEmbed");
const pg = require("./alias-functions/pickups/pickupGame");
const pickupChannelId = process.env.PICKUP_CHANNEL_ID;
const leagueManagerRoleId = process.env.LEAGUE_MANAGER_ROLE_ID;
const captainRoleId = process.env.CAPTAIN_ROLE_ID;
const coCaptainRoleId = process.env.CO_CAPTAIN_ROLE_ID;


function deletePickupTeams(data) {
    delete data.teams["RED Team"];
    delete data.teams["BLUE Team"];
    delete data.teams["PICKUP Queue"]
}

function clearAllTimeouts() {
    clearTimeout(pg.thirtyFiveMinuteTimer);
    clearTimeout(pg.ninetyMinuteTimer);
}

function writeToAliasFile(data) {
   return fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
          console.log(error);
        }
      });
}


function isLeagueManager(message, command) {
  if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) {
      return true
  } else {
      em.cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
      return false;
  }
}

function isCapOrCoCaptain(message, command) {
  if (message.member.roles.cache.find((role) => role.id === captainRoleId || role.id === coCaptainRoleId)) {
      return true
  } else {
      em.cautionEmbed(message, "FAILED", `You do not have permission to use the **!${command}** command!`)
      return false
  }
}
// can add commands to this before the else statement to re-use this function for multiple channels.
function msgFromPickupChannel(message) {
      if(message.channel.id === pickupChannelId) {
          return true;
      } else {
          em.cautionEmbed(message, "FAILED", `You can only use the pickup game commands in the #pickup-games channel!`);
          return false;
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
    if (teamName === "RED Team") continue;
    if (teamName === "BLUE Team") continue;
    if (teamName === "PICKUP Queue") continue;
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


function msgDeleter(message, count) {
  return message.channel.bulkDelete(count);
}

function readAliasData(filePath) {
  const aliases = fs.readFileSync(filePath);
  const data = JSON.parse(aliases);
  return data;
}

function writeAliasesData(filePath, data) {
  return fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const hf = {
  deletePickupTeams,
  clearAllTimeouts,
  writeToAliasFile,
  isLeagueManager,
  isCapOrCoCaptain,
  msgFromPickupChannel: msgFromPickupChannel,
  removeTeamRole,
  playerOnAnotherTeam,
  clearMessages,
  readAliasFile,
  msgDeleter,
  readAliasData,
  writeAliasesData
}

module.exports = hf;


