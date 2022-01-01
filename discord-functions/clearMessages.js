const Discord = require("discord.js");

function clearMessages(message, numberOfMessagesToBeDeleted) {
  setTimeout(() => {
    message.channel.bulkDelete(numberOfMessagesToBeDeleted);
  }, 3000);
}

module.exports = clearMessages;
