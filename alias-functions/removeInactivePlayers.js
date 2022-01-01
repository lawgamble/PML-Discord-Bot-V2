const rconPlayersListForPickups = require("../rcon-functions/checkRconUserCount");
const { redAndBlueTeamEmbed } = require("../discord-functions/generalEmbed");
const readAliasFile = require("../alias-functions/JSONParser");
const fs = require("fs");
const { Console } = require("console");

const pkFilePath = process.env.PICKUP_KICKER_LOG_FILEPATH;

const guildId = process.env.GUILD_ID;
const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;

let redTeam;
let blueTeam;
let pickupQueue;

let removalArray = [[], [], [], [], []];
let checkList = [];

let i = 0;
let j = 1;

async function checkInactivePlayers(filePath, data, message, gameStarted) {
  redTeam = data.teams["RED Team"];
  blueTeam = data.teams["BLUE Team"];
  pickupQueue = data.teams["PICKUP Queue"];

  if (redTeam.length === 0 || blueTeam.length === 0) {
    return true;
  }

  if (i > 4) i = 0;

  const rconPlayersList = await rconPlayersListForPickups();

  redTeam.forEach((player) => {
    // if player is not in game list or checkList - put them  in removal array && check list
    if (
      !rconPlayersList.includes(player.slice(2)) &&
      !checkList.includes(player.slice(2))
    ) {
      removalArray[i].push(player.slice(2));
      checkList.push(player.slice(2));
    }
  });
  blueTeam.forEach((player) => {
    if (
      !rconPlayersList.includes(player.slice(2)) &&
      !checkList.includes(player.slice(2))
    ) {
      removalArray[i].push(player.slice(2));
      checkList.push(player.slice(2));
    }
  });
  console.log(removalArray);

  // interval runs every 5 min until game ends
  removePlayer(data, j, redTeam, blueTeam, rconPlayersList, message, filePath);

  i++; // incriments every time checkInactivePlayers() is called -- every minute
  j++;
  if (j > 4) j = 0;
}

function removePlayer(
  data,
  index,
  redTeam,
  blueTeam,
  rconPlayersList,
  message,
  filePath
) {
  if (removalArray[index].length === 0) {
    // if nobody is on the removal list index, return.
    return;
  }

  removalArray[index].forEach((player) => {
    if (rconPlayersList.includes(player)) {
      // check AGAIN to see if they're on the list
      return; // this just moves to the next player in the removal array
    }

    const userDiscordId = getUserIdByUserName(data.players, "q-" + player);

    const redTeamPlayerIndex = redTeam.indexOf("q-" + player); // will return -1 if player is not in the array
    const blueTeamPlayerIndex = blueTeam.indexOf("q-" + player); // will return -1 if player is not in the array
    const indexInCheckList = checkList.indexOf("q-" + player); // will return -1 if player is not in the array

    if (redTeamPlayerIndex > -1) {
      if (redTeamPlayerIndex === 0)
        checkAndReassignRoles("q-" + player, data, message, redTeam);

      redTeam.splice(redTeamPlayerIndex, 1);
      checkList.splice(indexInCheckList, 1);

      // sendMessageToUser(userDiscordId, message);
      letTheWorldKnow(userDiscordId, message);
      logKickedUser("q-" + player, userDiscordId);
    }
    if (blueTeamPlayerIndex > -1) {
      if (blueTeamPlayerIndex === 0)
        checkAndReassignRoles("q-" + player, data, message, blueTeam);

      blueTeam.splice(blueTeamPlayerIndex, 1);
      checkList.splice(indexInCheckList, 1);

      //  sendMessageToUser(userDiscordId, message);
      letTheWorldKnow(userDiscordId, message); // sends channel msg and tags user that says he was kicked
      logKickedUser("q-" + player, userDiscordId);
    }
  });

  removalArray[index] = []; // after players are kicked, reset removal array at index j

  // this will alternate teams while adding from queue
  while (
    (pickupQueue.length > 0 && redTeam.length < 5) ||
    (pickupQueue.length > 0 && blueTeam.length < 5)
  ) {
    if (pickupQueue.length > 0 && redTeam.length < 5) {
      redTeam.push(pickupQueue.shift());
    }
    if (pickupQueue.length > 0 && blueTeam.length < 5) {
      blueTeam.push(pickupQueue.shift());
    }
  }
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
    if (error) {
      console.log(error);
    }
  });
  // sends the team embed again after someone is kicked and a player is moved from queue
  redAndBlueTeamEmbed(message, data, null, true); // might need to read file again before?
}

function checkAndReassignRoles(player, data, message, team) {
  const players = data.players;
  const currentCaptId = getUserIdByUserName(players, player);
  const foundUser1 = message.guild.members.fetch(currentCaptId).then((user) => {
    user.roles.remove(pickupCaptainRoleId);
  });

  if (team[1]) {
    const newCaptName = team[1];
    const newCaptId = getUserIdByUserName(players, newCaptName);

    const foundUser2 = message.guild.members.fetch(newCaptId).then((user) => {
      user.roles.add(pickupCaptainRoleId).then((user) => {
        user.send(
          "You were automatically assigned a captain role during the pickup game. Please make sure you close the game when you are finished!"
        );
      });
    });
  }
}

function getUserIdByUserName(players, userName) {
  return Object.keys(players).find((key) => players[key] === userName);
}

function sendMessageToUser(playerId, message) {
  const foundUser1 = message.guild.members.fetch(playerId).then((user) => {
    user.send(
      "You were automatically removed from the pickup game due to inactivity.\nThis is no bueno.\nYou are making it less enjoyable to play a casual pickup game that shouldn't be annoying or stressful.\nIf you continue to do this, your pickup game permissions will be revoked.\nFoooorrreeeeeever.\nDick."
    );
  });
}

function logKickedUser(player, userDiscordId) {
  const date = new Date().toLocaleString();
  const log = `${date} - ${userDiscordId} - ${player}\n`;
  fs.appendFile(pkFilePath, log, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

function letTheWorldKnow(userDiscordId, message) {
  message.channel.send(
    `<@${userDiscordId}> was kicked from the pickup game due to inactivity.`
  );
}

module.exports = checkInactivePlayers;
