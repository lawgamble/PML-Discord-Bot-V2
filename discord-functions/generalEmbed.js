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

module.exports = {
  cautionEmbed,
  successEmbed,
  noActionRequiredEmbed,
  teamNewsEmbed,
};
