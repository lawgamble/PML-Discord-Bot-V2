const { MessageEmbed } = require("discord.js");

function cautionEmbed(message, title, field) {
  let embed = new MessageEmbed()
    .setColor("ff0000")
    .setTitle(title)
    .addField("Failed:", field);
  message.reply({
    embeds: [embed],
  });
}

function successEmbed(message, title, field) {
  let embed = new MessageEmbed()
    .setColor("00FF00")
    .setTitle(title)
    .addField("Success:", field);
  message.reply({
    embeds: [embed],
  });
}

function noActionRequiredEmbed(message, title, field) {
  let embed = new MessageEmbed()
    .setColor("FFFF00")
    .setTitle(title)
    .addField("_____", field);
  message.reply({
    embeds: [embed],
  });
}

function teamNewsEmbed(channel, title) {
  let embed = new MessageEmbed().setTitle(title);
  channel.send({
    embeds: [embed],
  });
}

function pickupGameTeamEmbed(message, data) {
  const redTeam = data.teams["RED Team"];
  const blueTeam = data.teams["BLUE Team"];
  let redTeamString = `-`;
  let blueTeamString = `-`;

  if (redTeam != undefined) {
    redTeam.forEach((member) => {
      const mem = member.slice(2);
      redTeamString += mem + "\n";
    });
  }
  if (blueTeam != undefined) {
    blueTeam.forEach((member) => {
      const mem = member.slice(2);
      blueTeamString += mem + "\n";
    });
  }

  let embed = new MessageEmbed()
    .setColor("#A020F0")
    .setTitle("Team RED / Team BLUE")
    .addFields(
      {
        name: `RED Team: --- (${
          redTeam != undefined ? 5 - redTeam.length : 5
        }) \n`,
        value: redTeamString,
      },
      {
        name: `BLUE Team: --- (${
          blueTeam != undefined ? 5 - blueTeam.length : 5
        }) \n`,
        value: blueTeamString,
      }
    );
  message.reply({
    embeds: [embed],
  });
}

function simpleReplyEmbed(message, title) {
  let embed = new MessageEmbed().setTitle(title);
  message.reply({
    embeds: [embed],
  });
}

module.exports = {
  cautionEmbed,
  successEmbed,
  noActionRequiredEmbed,
  teamNewsEmbed,
  pickupGameTeamEmbed,
  simpleReplyEmbed,
};
