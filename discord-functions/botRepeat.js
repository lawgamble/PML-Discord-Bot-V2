let channel = undefined;
const failedMessage = "!repeat message not sent because there was actually no message."

function botRepeat(message, arguments) {
  if(arguments.length < 1) {
    message.author.send(failedMessage);
    message.delete();
    return;
  }
  const lastArgument = arguments[arguments.length - 1];
  if (lastArgument.startsWith("<#")) {
    const channelId = lastArgument.replace("<#", "").replace(">", "");
    channel = message.guild.channels.cache.find((channel) => channel.id === channelId);
    if (channel !== undefined) {
      let messageToRepeat = arguments.slice(0, arguments.length - 1).join(" ");
      if(messageToRepeat === "") {
        message.author.send(failedMessage);
        message.delete();
        return;
      }
      message.delete();
      channel.send(messageToRepeat);
    }
  }
  else {
    message.delete();
    message.channel.send(arguments.join(" "));
  }
}

module.exports = botRepeat;