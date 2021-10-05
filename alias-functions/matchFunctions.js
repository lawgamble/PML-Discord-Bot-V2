const Discord = require("discord.js");
const teamImage = require("../imageURLs");

function matchFunction(message) {
  const botMsg1 = "Input Team 1 and Press ENTER";
  const botMsg2 = "Input Team 2 and Press ENTER";
  const botMsg3 = "Input DATE and Press ENTER (01/01/2021) ";
  const botMsg4 = "Input TIME and Press Enter (12:00 AM/PM)";
  const botMsg5 = "Input Time Zone and Press Enter (EST, BST...)";
  const botMsg6 = "Input League Server(PML1, PML2...) ";
  const botMsg7 =
    "Do NOT make message edits. If you made a mistake, just input 'cancel', press ENTER and try again.";

  const filter = (m) => {
    console.log(m.content);
    m.author.id === message.author.id;
  };

  const instructionsEmbed = new Discord.MessageEmbed()
    .setTitle("Create Matchup Instructions")
    .addFields(
      { name: "Step 1", value: botMsg1 },
      { name: "Step 2", value: botMsg2 },
      { name: "Step 3", value: botMsg3 },
      { name: "Step 4", value: botMsg4 },
      { name: "Step 5", value: botMsg5 },
      { name: "Step 6", value: botMsg6 },
      { name: "**Disclaimer**", value: botMsg7 }
    )
    .setColor("#FFFF00");

  message.author.createDM().then((c) => {
    console.log("ID", c.id);
    c.send({ embeds: [instructionsEmbed] });

    const collector = c.createMessageCollector(c.id, filter, {
      max: 7,
      time: 10000,
    });

    let collectedSet = new Set();
    let count = 0;

    collector.on("collect", () => {
      const collectedValues = collector.collected;

      collectedValues.each((msg) => {
        if (msg.content != botMsg1) {
          if (msg.content === "cancel") {
            collector.stop("Cancelled");
            return null;
          }

          if (msg.editedTimestamp != null) {
            collector.stop("You can't make edits!");
          }
          collectedSet.add(msg.content);
          count = collectedSet.size;
        }
      });

      console.log(collectedSet);

      if (count >= 7) {
        collector.stop("Maximum input reached!");
      }
    });
    collector.on("end", () => {
      const collectedArray = [...collectedSet];
      console.log(collectedArray);

      if (count < 7) {
        const cancelEmbed = new Discord.MessageEmbed()
          .setTitle("Cancelled MatchTime")
          .addField(
            "Try Again with '!matchTime'",
            "**NOTE:** \nYou can't edit messages that have already been sent."
          )
          .setColor("#FF0000");

        dmChannel.send({ embeds: [cancelEmbed] });
      } else {
        const matchupEmbed = new Discord.MessageEmbed()
          .setTitle(`${collectedArray[1]}  vs.  ${collectedArray[2]}`)
          // .setThumbnail(teamImage[collectedArray[2]])
          .addFields(
            { name: "When:", value: `${collectedArray[3]}` },
            {
              name: "Time:",
              value: `${collectedArray[4]} ${collectedArray[5]}`,
            },
            { name: "Server", value: collectedArray[6] }
          );

        message.channel.send({ embeds: [matchupEmbed] });
      }
    });
  });
}

// module.exports = matchFunction;

// 893352595500957746
// 893352595500957746
// 893352595500957746
