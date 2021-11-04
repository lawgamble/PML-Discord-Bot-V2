const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const readAliasFile = require("../alias-functions/JSONParser");
const teamImages = require("../imageURLs");
const pickupGameImage = teamImages["pickupPmlLogo"];

let redTeam;
let blueTeam;

function redAndBlueMatchupEmbed(message, title, data) {
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

function blackAndGoldMatchupEmbed(message, title, data) {
  blackTeam = data.teams["BLACK Team"];
  goldTeam = data.teams["GOLD Team"];
  let blackTeamRoster = "";
  let goldTeamRoster = "";

  blackTeam.forEach((player) => {
    blackTeamRoster += `${player.slice(2)}\n`;
  });
  goldTeam.forEach((player) => {
    goldTeamRoster += `${player.slice(2)}\n`;
  });

  let embed2 = new MessageEmbed()
    .setImage(pickupGameImage)
    .setColor("#9932CC")
    .setTitle(title)
    .addFields(
      { name: "BLACK Team", value: blackTeamRoster },
      { name: "GOLD Team", value: goldTeamRoster }
    );
  message.channel.send({
    embeds: [embed2],
  });
}

module.exports = { redAndBlueMatchupEmbed, blackAndGoldMatchupEmbed };
