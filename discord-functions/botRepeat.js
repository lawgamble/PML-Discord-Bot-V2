function botRepeat(message, arguments) {
    let channel = message.guild.channels.cache.find((channel) => channel.name === arguments[arguments.length - 1]);
    if(channel !== undefined) {
        let messageToRepeat = arguments.slice(0, arguments.length - 1).join(" ");
        message.delete();
        channel.send(messageToRepeat);
    } else {
    message.delete();
    message.channel.send(arguments.join(" "));
 }
}

module.exports = botRepeat;