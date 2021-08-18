function playerOnAnotherTeam(message, teams, playerName, DiscordName) {
  for (const teamName in teams) {
    const teamWithPlayers = { [teamName]: teams[teamName] };
    if (Object.values(teamWithPlayers).length === 0) continue;
    if (Object.values(teamWithPlayers)[0].includes(playerName)) {
      message.reply(
        `**${DiscordName}** is already on the **${teamName}** roster!`
      );
      return true;
    }
  }
  return false;
}

module.exports = playerOnAnotherTeam;
