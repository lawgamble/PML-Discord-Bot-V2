const Discord = require("discord.js");
const readAliasFile = require("./JSONParser");
// const channel = process.env.ROSTERS_CHANNEL;

function embed(filePath, message) {
  let teamsArray = [];
  let playersArray = [];

  readAliasFile(filePath, (error, data) => {
    if (error) {
      console.log(error);
    }
    const teams = data.teams;
    let teamsArray = [];
    for (const property in teams) {
      teamsArray.push(property, teams[property]);
    }
    console.log(teamsArray);

    const embed = new Discord.MessageEmbed().setTitle("Rosters").setFields();

    // message.channel.send({ embeds: [embed] });
  });
}

module.exports = embed;
