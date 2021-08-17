function playerOnAnotherTeam(message, teams, string, DiscordName) {
  for (const value in teams) {
    const iterationObject = { [value]: teams[value] };
    if (Object.values(iterationObject).length === 0) continue;
    if (Object.values(iterationObject)[0].includes(string)) {
      message.reply(
        `**${DiscordName}** is already on the **${value}** roster!`
      );
      return true;
    }
  }
  return false;
}

module.exports = playerOnAnotherTeam;
