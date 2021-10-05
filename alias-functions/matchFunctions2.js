const Discord = require("discord.js");

function matchFunction2(message) {
  const disclaimer =
    "Do NOT make message edits. If you made a mistake, just input 'cancel', press ENTER and try again.";
  const botMsgArray = [
    `Input Team 1 and Press ENTER`,
    "Input Team 2 and Press ENTER",
    "Input DATE and Press ENTER (01/01/2021)",
    "Input TIME and Press Enter (12:00 AM/PM)",
    "Input Time Zone and Press Enter (EST, BST...)",
    "Input League Server(PML1, PML2...)",
  ];
  let userInputArray = [];
  let collectedSet = new Set();
  let counter = 0;

  const cancelEmbed = new Discord.MessageEmbed()
    .setTitle("Cancelled MatchTime")
    .addField(
      "Try Again with '!matchTime'",
      "**NOTE:** Editing messages will do absolutely nothing."
    )
    .setColor("#FF0000");
  const successEmbed = new Discord.MessageEmbed()
    .setTitle("Success!")
    .addField(
      "Match successfully created.",
      "Check the appropriate channel to see the matchups!"
    )
    .setColor("#00FF00");

  const filter = (m) => {
    m.author.id === message.author.id;
  };

  const collector = new Discord.MessageCollector(message.channel, {
    max: 7,
    time: 60000,
  });

  const instructionsStartEmbed = new Discord.MessageEmbed()
    .setTitle("Create Match Instructions")
    .addField(`Step ${counter + 1} of 6`, botMsgArray[counter++])
    .setColor("#FFFF00");
  message.channel.send({ embeds: [instructionsStartEmbed] });

  collector.on("collect", (m) => {
    if (m.content === "cancel") {
      collector.stop("Cancelled");
      message.channel.send({ embeds: [cancelEmbed] });
      setTimeout(() => {
        message.channel.bulkDelete(99);
      }, 5000);
      return;
    }
    if (m.author.id === message.author.id) {
      if (counter <= botMsgArray.length - 1) {
        const instructionsEmbed = new Discord.MessageEmbed()
          .addField(`Step ${counter + 1} of 6`, botMsgArray[counter++])
          .setColor("#FFFF00");

        message.channel.send({ embeds: [instructionsEmbed] });
      }
      userInputArray.push(m.content);
    }
    if (userInputArray.length >= 6 && m.author.id === message.author.id) {
      const matchupEmbed = new Discord.MessageEmbed()
        .setTitle(`${userInputArray[0]}  vs.  ${userInputArray[1]}`)
        .addFields(
          { name: "When:", value: `${userInputArray[2]}` },
          {
            name: "Time:",
            value: `${userInputArray[3]} ${userInputArray[4]}`,
          },
          { name: "Server", value: userInputArray[5] }
        );

      const confirmEmbed = new Discord.MessageEmbed()
        .setTitle("Please Confirm")
        .setFields(
          { name: "Yes?", value: "Type yes and press ENTER" },
          { name: "No?", value: "Type no and press ENTER" }
        )
        .setColor("#FFFF00");

      if (userInputArray.length < 7) {
        message.channel.send({ embeds: [matchupEmbed] });
        message.channel.send({ embeds: [confirmEmbed] });
      }

      collector.collected.forEach((word) => {
        if (word.content === "yes") {
          // send to specific channel
          message.author.send({ embeds: [matchupEmbed] });
          message.channel.send({ embeds: [successEmbed] });
          collector.stop();
          setTimeout(() => {
            message.channel.bulkDelete(99);
          }, 5000);
        } else if (word.content === "no") {
          message.channel.send({ embeds: [cancelEmbed] });
          setTimeout(() => {
            message.channel.bulkDelete(99);
          }, 5000);
        }
      });
    }
  });
  collector.on("end", () => console.log("ENDED"));
}

module.exports = matchFunction2;
