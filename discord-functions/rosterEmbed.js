const Discord = require("discord.js");
const hf = require("../helperFunctions");
const teamImages = require("../imageURLs");
const rostersChannelId = process.env.ROSTERS_ID;

function rosterEmbed(filePath, message) {
  hf.readAliasFile(filePath, (error, data) => {
    if (error) {
      console.log(error);
    }
    const teams = data.teams;
    let teamString = "";
    let roster = "";
    let index = 0;

    // new Embed for teams and rosters

    let rostersChannel = message.guild.channels.cache.get(rostersChannelId);

    function clear() {
      rostersChannel.bulkDelete(99);
    }
    clear();

    for (let teamName in teams) {
      const allRosters = Object.values(teams);
      const teamImage = teamImages[teamName];
      let singleTeamRoster = allRosters[index];

      if (singleTeamRoster.length === 0) {
        roster = "Nobody...yet.";
      }

      singleTeamRoster.forEach((player) => {
        roster += `${player.slice(2)}\n`;
      });
      teamString += `${roster}\n`;

      index++;
      roster = "";

      let embed_Rosters = new Discord.MessageEmbed()
        .setTitle(`${teamName}`)
        .addField(`___`, teamString);

      if (teamImages[teamName]) embed_Rosters.setImage(`${teamImage}`);

      rostersChannel.send({
        embeds: [embed_Rosters],
      });

      teamString = "";
    }
  });
}

module.exports = rosterEmbed;
