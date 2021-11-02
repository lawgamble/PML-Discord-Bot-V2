const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const readAliasFile = require("../alias-functions/JSONParser");
const teamImages = require("../imageURLs");
const pickupGameImage = teamImages["pickupPmlLogo"];

let redTeam;
let blueTeam;

function pickupGameMatchupEmbed(message, title, data) {
  redTeam = data.teams["RED Team"];
  blueTeam = data.teams["BLUE Team"];
  let redTeamRoster = "";
  let blueTeamRoster = "";

  redTeam.forEach((player) => {
    redTeamRoster += `${player.slice(2)}\n`;
  });
  blueTeam.forEach((player) => {
    blueTeamRoster += `${player.slice(2)}\n`;
  });

  let embed = new MessageEmbed()
    .setImage(pickupGameImage)
    .setColor("#9932CC")
    .setTitle(title)
    .addFields(
      { name: "RED Team", value: redTeamRoster },
      { name: "BLUE Team", value: blueTeamRoster }
    );
  message.channel.send({
    embeds: [embed],
  });
}

module.exports = pickupGameMatchupEmbed;
