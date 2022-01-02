const Discord = require("discord.js");
const scoresChannelId = process.env.SCORES_CHANNEL_ID;
const teamImages = require("../../imageURLs");
const { matchPmlLogo } = require("../../imageURLs");

function matchScore(message) {
  let userInputArray = [];
  let counter = 0;
  let winner;
  const scoresChannel = message.guild.channels.cache.get(scoresChannelId);

  const botMsgArray = [
    "Name of the Team 1",
    "Name of Team 2",
    "What was the first map?",
    `What was the score on Map 1? \n(Example: 10-5)`,
    `Who won on Map 1?`,
    "What was the second map?",
    `What was the score on Map 2? \n(Example: 10-5)`,
    `Who won on Map 2?`,
    "What was the third map? If no third map, type **'none'**",
    `What was the score on Map 3? \n(Example: 10-5`,
    `Who won on Map 3 `,
  ];

  const cancelEmbed = new Discord.MessageEmbed()
    .setTitle("Cancelled Score Submission")
    .addField(
      "Try Again with '!matchScore'",
      "**NOTE:** Editing messages will do absolutely nothing."
    )
    .setColor("#FF0000");
  const successEmbed = new Discord.MessageEmbed()
    .setTitle("Success!")
    .addField(
      "Score successfully submitted.",
      "Check the appropriate channel to see the scores!"
    )
    .setColor("#00FF00");

  const endEmbed = new Discord.MessageEmbed()
    .setTitle("Score Submission Process Has Ended")
    .setColor("#FF0000");

  const instructionsStartEmbed = new Discord.MessageEmbed()
    .setTitle("Score Submission Instructions")
    .addField(`Step ${counter + 1}`, botMsgArray[counter++])
    .setColor("#FFFF00");

  const confirmEmbed = new Discord.MessageEmbed()
    .setTitle("Please Confirm")
    .setFields(
      { name: "Yes", value: "Type 'yes' and press ENTER" },
      { name: "No", value: "Type 'no' and press ENTER" }
    )
    .setColor("#FFFF00");

  message.channel.send({ embeds: [instructionsStartEmbed] });

  //Collector
  const collector = new Discord.MessageCollector(message.channel, {
    time: 180000,
  });

  collector.on("collect", (m) => {
    if (m.content === "cancel") {
      collector.stop("Cancelled");
      message.channel.send({ embeds: [cancelEmbed] });
      setTimeout(() => {
        message.channel.bulkDelete(18);
      }, 5000);
      return;
    }

    // two game embed
    if (m.content === "none" || m.content === "None" || m.content === "NONE") {
      winner = teamImages[userInputArray[7]];
      const twoGameEmbed = new Discord.MessageEmbed()
        .setTitle(
          `League Match Score:\n${userInputArray[0]}  vs.  ${userInputArray[1]}`
        )
        .setImage(winner)
        .setThumbnail(matchPmlLogo)
        .addFields(
          {
            name: `${userInputArray[2]}`,
            value: `${userInputArray[3]} - ${userInputArray[4]}`,
          },
          {
            name: `${userInputArray[5]}`,
            value: `${userInputArray[6]} - ${userInputArray[7]}`,
          },
          {
            name: "Match Winner:",
            value: `${userInputArray[7]}`,
          }
        )
        .setColor("#ce3d00");

      message.channel.send({ embeds: [twoGameEmbed] });
      message.channel.send({ embeds: [confirmEmbed] });
      collector.stop();

      const confirmCollector = new Discord.MessageCollector(message.channel, {
        time: 180000,
      });

      confirmCollector.on("collect", () => {
        confirmCollector.collected.forEach((word) => {
          if (word.content.toLowerCase() === "yes") {
            scoresChannel.send({ embeds: [twoGameEmbed] });
            message.channel.send({ embeds: [successEmbed] });
            confirmCollector.stop("Successfully Created");
            setTimeout(() => {
              message.channel.bulkDelete(18);
            }, 5000);
            return;
          } else if (word.content === "no") {
            message.channel.send({ embeds: [cancelEmbed] });
            confirmCollector.stop("cancelled");
            setTimeout(() => {
              message.channel.bulkDelete(18);
            }, 5000);
            return;
          }
        });
      });
      confirmCollector.on("end", () =>
        message.channel.send({ embeds: [endEmbed] })
      );
    }

    // m collection
    if (
      m.author.id === message.author.id &&
      m.content != "none" &&
      m.content != "None" &&
      m.content != "NONE"
    ) {
      if (counter <= botMsgArray.length - 1) {
        const instructionsEmbed = new Discord.MessageEmbed()
          .addField(`Step ${counter + 1}`, botMsgArray[counter++])
          .setColor("#FFFF00");

        message.channel.send({ embeds: [instructionsEmbed] });
      }
      userInputArray.push(m.content);
    }

    if (userInputArray.length >= 11 && m.author.id === message.author.id) {
      winner = userInputArray[10];
      const threeGameEmbed = new Discord.MessageEmbed()
        .setTitle(
          `League Match Score:\n${userInputArray[0]}  vs.  ${userInputArray[1]}`
        )
        .setThumbnail(matchPmlLogo)
        .setImage(teamImages[winner])
        .addFields(
          {
            name: `${userInputArray[2]}`,
            value: `${userInputArray[3]} - ${userInputArray[4]}`,
          },
          {
            name: `${userInputArray[5]}`,
            value: `${userInputArray[6]} - ${userInputArray[7]}`,
          },

          {
            name: `${userInputArray[8]}`,
            value: `${userInputArray[9] + "-" + userInputArray[10]}`,
          },
          {
            name: "Match Winner:",
            value: `${userInputArray[10]}`,
          }
        )
        .setColor("#ce3d00");

      const confirmEmbed = new Discord.MessageEmbed()
        .setTitle("Please Confirm")
        .setFields(
          { name: "Yes", value: "Type 'yes' and press ENTER" },
          { name: "No", value: "Type 'no' and press ENTER" }
        )
        .setColor("#FFFF00");

      if (userInputArray.length < 12) {
        message.channel.send({ embeds: [threeGameEmbed] });
        message.channel.send({ embeds: [confirmEmbed] });
      }

      collector.collected.forEach((word) => {
        if (word.content.toLowerCase() === "yes") {
          // send to specific channel
          const scoresChannel =
            message.guild.channels.cache.get(scoresChannelId);
          scoresChannel.send({ embeds: [threeGameEmbed] });
          message.channel.send({ embeds: [successEmbed] });
          collector.stop("Success");
          setTimeout(() => {
            message.channel.bulkDelete(18);
          }, 5000);
          return;
        } else if (word.content === "no") {
          message.channel.send({ embeds: [cancelEmbed] });
          collector.stop("canceled");
          setTimeout(() => {
            message.channel.bulkDelete(18);
          }, 5000);
          return;
        }
      });
    }
  });

  collector.on("end", () => {
    message.channel.send({ embeds: endEmbed });
  });
}

module.exports = matchScore;
