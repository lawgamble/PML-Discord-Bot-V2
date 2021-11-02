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
  let redTeamString = "(c)";
  let blueTeamString = "(c)";

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
          redTeam != undefined
            ? `${5 - redTeam.length} spots left`
            : `5 spots left`
        }) \n`,
        value: redTeamString,
      },
      {
        name: `BLUE Team: --- (${
          blueTeam != undefined
            ? `${5 - blueTeam.length} spots left`
            : `5 spots left`
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
  channel.send({
    embeds: [embed],
  });
}

function wipeTeamsEmbed(message, title) {
  let embed = new MessageEmbed().setTitle(title);
  message.channel.send({
    embeds: [embed],
  });
}

function startPickupGameEmbed(message, title, field) {
  let embed = new MessageEmbed()
    .setTitle(title)
    .setColor("00FF00")
    .addField("Check your DM's", field);
  message.channel.send({
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
  wipeTeamsEmbed,
  startPickupGameEmbed,
};
