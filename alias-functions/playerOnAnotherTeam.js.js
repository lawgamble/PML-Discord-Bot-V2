const { cautionEmbed } = require("../discord-functions/generalEmbed");

function playerOnAnotherTeam(message, teams, playerName, DiscordName) {
  for (const teamName in teams) {
    const teamWithPlayers = { [teamName]: teams[teamName] };
    if (Object.values(teamWithPlayers).length === 0) continue;
    if (Object.values(teamWithPlayers)[0].includes(playerName)) {
      let title = "No-can-do!";
      let uniqueMessage = `**${DiscordName}** is already on the **${teamName}** roster!`;
      cautionEmbed(message, title, uniqueMessage);
      return true;
    }
  }
  return false;
}

module.exports = playerOnAnotherTeam;
