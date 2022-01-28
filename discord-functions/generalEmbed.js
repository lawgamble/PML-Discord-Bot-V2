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

function redAndBlueTeamEmbed(message, data, timeLeft, gameStarted) {
  const redTeam = data.teams["RED Team"];
  const blueTeam = data.teams["BLUE Team"];
  const queueTeam = data.teams["PICKUP Queue"];
  let redTeamString = "`c`";
  let blueTeamString = "`c`";
  let queueTeamString = "---\n"
  
  const timerMsg = `${timeLeft} minutes left to fill the teams`;
  const gameStartedMsg = `This Pickup Game is currently running!`;

  if (redTeam != undefined) {
    redTeam.forEach((member) => {
      const mem = member.slice(2);
      redTeamString += mem + "\n  ";
    });
  }
  if (blueTeam != undefined) {
    blueTeam.forEach((member) => {
      const mem = member.slice(2);
      blueTeamString += mem + "\n  ";
    });
  }
  if (queueTeam != undefined) {
    queueTeam.forEach((member) => {
      const mem = member.slice(2);
      queueTeamString += mem + "\n";
    });
  }

  let embed = new MessageEmbed()
    .setColor("#A020F0")
    .setTitle("RED  vs  BLUE")
    .addFields(
      {
        name: `_RED_     -${
          redTeam != undefined
            ? `${5 - redTeam.length} spots left`
            : `5 spots left`
        }- \n`,
        value: redTeamString,
      },
      {
        name: `_BLUE_     -${
          blueTeam != undefined
            ? `${5 - blueTeam.length} spots left`
            : `5 spots left`
        }- \n`,
        value: blueTeamString,
      },
      {
        name: "Queue:",
        value: queueTeamString,
      },
      {
        name: "_____",
        value: `${gameStarted ? gameStartedMsg : timerMsg}`,
      }
    );
  message.channel.send({
    embeds: [embed],
  });
}

function blackAndGoldTeamEmbed(message, data, timeLeft, gameStarted) {
  console.log(gameStarted);
  const blackTeam = data.teams["BLACK Team"];
  const goldTeam = data.teams["GOLD Team"];
  let blackTeamString = "(c)";
  let goldTeamString = "(c)";
  const timerMsg = `There are ${timeLeft} minute(s) left to fill the teams before they're flushed!`;
  const gameStartedMsg = `This Pickup Game is currently running!`;

  if (blackTeam != undefined) {
    blackTeam.forEach((member) => {
      const mem = member.slice(2);
      blackTeamString += mem + "\n";
    });
  }
  if (goldTeam != undefined) {
    goldTeam.forEach((member) => {
      const mem = member.slice(2);
      goldTeamString += mem + "\n";
    });
  }

  let embed = new MessageEmbed()
    .setColor("#463500")
    .setTitle("Team BLACK / Team GOLD")
    .addFields(
      {
        name: `BLACK Team: --- (${
          blackTeam != undefined
            ? `${5 - blackTeam.length} spots left`
            : `5 spots left`
        }) \n`,
        value: blackTeamString,
      },
      {
        name: `GOLD Team: --- (${
          goldTeam != undefined
            ? `${5 - goldTeam.length} spots left`
            : `5 spots left`
        }) \n`,
        value: goldTeamString,
      },
      {
        name: "_____",
        value: `${gameStarted ? gameStartedMsg : timerMsg}`,
      }
    );
  message.reply({
    embeds: [embed],
  });
}

function simpleReplyEmbed(message, title) {
  let embed = new MessageEmbed().setTitle(title);
  message.channel.send({
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

function pickupGameMatchupEmbed(message, title, field) {
  let embed = new MessageEmbed()
    .setTitle(title)
    .setColor("00FF00")
    .addField("Matchup:", field);
  message.channel.send({
    embeds: [embed],
  });
}

const em = {
  cautionEmbed,
  successEmbed,
  noActionRequiredEmbed,
  teamNewsEmbed,
  redAndBlueTeamEmbed,
  blackAndGoldTeamEmbed,
  simpleReplyEmbed,
  wipeTeamsEmbed,
  startPickupGameEmbed,
  pickupGameMatchupEmbed,
}

module.exports = em;