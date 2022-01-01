
  const fs = require("fs");
  const net = require("net");
  const { Timer } = require('timer-node');
  const exec = require("child_process").exec;
  const readAliasFile = require("./JSONParser");
  const {
    cautionEmbed,
    successEmbed,
    blackAndGoldTeamEmbed,
    simpleReplyEmbed,
    startPickupGameEmbed,
    wipeTeamsEmbed,
  } = require("../discord-functions/generalEmbed");
  const { blackAndGoldMatchupEmbed } = require("../discord-functions/pickupGameMatchupEmbed");
 
  
  const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;
  
  
  const teamFilter = ["black", "gold"];
  const otherArgumentsFilter = ["leave", "teams"];
  // make sure this doesn't mess up the first 

  const botRebootCommand = process.env.BOT_REBOOT_COMMAND;
  
  
  let thirtyFiveMinuteTimer2;
  let ninetyMinuteTimer2;
  let teamName;
  let playerToAdd;
  let firstReadNumber;
  let secondReadNumber;
  let playerData;
 // let gameStarted = false;
  const timer = new Timer();
  let pin;

const serverPort = process.env.SERVER_PORT;
const serverIp = process.env.PICKUP_SERVER_IP;
const serverPassword = process.env.SERVER_PASSWORD;
const pickupChannelId = process.env.PICKUP_CHANNEL_ID;

let socket = {};

const server = {
  port: serverPort,
  ip: serverIp,
  password: serverPassword,
};
  
  function pickupGame2(filePath, message, arguments, command) {

   
    if(gameStarted && arguments[0] === "start") return cautionEmbed(message, "", "A game is already in progress!");

    if(!gameStarted && arguments[0] === "end") return cautionEmbed(message, "", "There is no game currently running!"); 

   // if(gameStarted && arguments[0] !== "end") return cautionEmbed(message, "", "The Pickup Game has already started!\nYou can't make any commands other than '!pickup end' while a game is running.");

    if(gameStarted && arguments[0] === "end") {
      if(message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
        clearTimeout(ninetyMinuteTimer2);
        ninetyMinuteTimer2 = null;
        wipeBlackAndGoldTeams(message, filePath, thirtyFiveMinuteTimer2, ninetyMinuteTimer2);
        gameStarted = false;
        timer.stop();
        return;
      }
      return;
    } 



    // startPickup game args are the message, the filePath and if conditions should be skipped
     if(arguments[0] === "start") {
       return startPickupGame2(message, filePath, false);
     }


    const pickupGameCaptainRole = message.guild.roles.cache.find(role => role.id === pickupCaptainRoleId);
    const authorId = message.author.id;
  
    // check if valid argument first.
    if (!otherArgumentsFilter.includes(arguments[0]?.toLowerCase()) && !teamFilter.includes(arguments[0]?.toLowerCase())) {
      return cautionEmbed(
        message,
        "", `!${command} ${arguments[0]} is not a valid !pickup command!\n **Valid Commands**\n!pickup black \n*puts you on BLACK Team*\n!pickup gold \n*puts you on GOLD Team*\n!pickup leave \n*removes you from either team*`
      );
    }
  
    // if argument is black or gold, change team name to argument.
    if (teamFilter.includes(arguments[0].toLowerCase())) {
      teamName = `${arguments[0].toUpperCase()} Team`;
    }
  
    let teamToBeCreated = {
      [teamName]: [],
    };
  
    readAliasFile(filePath, (error, data) => {
      if (error) {
        console.log(error);
      }
  
      const playersListData = data.players;
  
      firstReadNumber = countPlayersOnBlackAndGoldTeams(data);
  
      // creates embed of the teams when command === "teams"
      if (arguments[0].toLowerCase() === "teams") {
        if (data.teams.hasOwnProperty("BLACK Team") || data.teams.hasOwnProperty("GOLD Team")) {
          const timePassedMS = Date.now() - timer.startedAt(); 
          const timePassedSec = Math.floor(timePassedMS / 1000);
          const timePassedMin = (timePassedSec / 60);
          const timeLeft = Math.ceil(35 - timePassedMin);
          blackAndGoldTeamEmbed(message, data, timeLeft, gameStarted);
        }
        else {
          simpleReplyEmbed(message, "No Pickup Games Found")
        }
        return;
      }
  
      // check if player wants to leave
      if (arguments[0].toLowerCase() === "leave") {
        return leavePickupGame(message, data, playersListData, blackTeam = data.teams["BLACK Team"], goldTeam = data.teams["GOLD Team"], authorId, filePath);
      }
  
      // check if user is registered
      if (checkIfUserIsRegistered(message, playersListData, authorId)) {
        playerToAdd = playersListData[authorId];
      }
      else {
        return;
      }
  
      // if neither team exists on initial read, set 20 min timer
      if (!data.teams.hasOwnProperty("BLACK Team") && !data.teams.hasOwnProperty("GOLD Team")) {
        timer.start();
        thirtyFiveMinuteTimer2 = setTimeout(() => {
          wipeBlackAndGoldTeams(message, filePath, thirtyFiveMinuteTimer2, ninetyMinuteTimer2);
          timer.stop();
          thirtyFiveMinuteTimer2 = null;
        }, 2100000);
      }


  
      // if team doesn't exist, add it to  data.teams
      if (!data.teams.hasOwnProperty(teamName)) {
        data.teams = {
          ...data.teams,
          ...teamToBeCreated,
        };
      }
  
      // if user is NOT an the other team
      if (checkIfUserOnOtherTeam(data, arguments, authorId, message)) {
        if (data.teams[teamName].length < 5) {
          data.teams[teamName].push(playerToAdd);
          data.teams[teamName] = [...new Set(data.teams[teamName])];
          if(gameStarted === true) {
            message.client.users.fetch(authorId).then((user) => {
                user.send(`Pickup Game servername: PML Pickup Games! [PavlovMasterLeague.com]\nPickup Game Pin: ${pin}`);
            })
            restartOtherBot();
          }
        }
        else {
          cautionEmbed(message, "No-Can-Do!", `The ${arguments[0].toUpperCase()} Team already has 5 players!`);
        }
      }
      else {
        return;
      }
      // Writes to aliases.json --- this will write the team, if needed and the new player joining
      fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
          console.log(error);
        }
      });
    });
  
    const readFileAgain = setTimeout(() => {
      readAliasFile(filePath, (error, data) => {
        if (error) {
          console.log(error);
        }
        
        // read the file a second time ---
        secondReadNumber = countPlayersOnBlackAndGoldTeams(data);

        // if teams are full, start the game automatically
        if (secondReadNumber === 10 && gameStarted === false) return startPickupGame2(message, filePath, true);
  
        // if users leave and teams are empty, cancel the Pickup Game and timer.
        if (arguments[0].toLowerCase() === "leave") {
          if (secondReadNumber === 0 && data.teams["BLACK Team"] || secondReadNumber === 0 && data.teams["GOLD Team"]) {
            clearTimeout(thirtyFiveMinuteTimer2);
            thirtyFiveMinuteTimer2 = null;
            timer.stop();
            return wipeBlackAndGoldTeams(message, filePath, thirtyFiveMinuteTimer2, ninetyMinuteTimer2);
          }
        }
  
        if (data.teams.hasOwnProperty("BLACK Team")) {
          if (data.teams["BLACK Team"][0] != undefined) {
            const blackTeamCaptianUserName = data.teams["BLACK Team"][0];
            const blackTeamCaptainDiscordId = getUserIdByUserName(data.players, blackTeamCaptianUserName);
            const foundUserBlackTeam = message.guild.members.cache.find((user) => user.id === blackTeamCaptainDiscordId);
            foundUserBlackTeam.roles.add(pickupGameCaptainRole);
          };
        }
        if (data.teams.hasOwnProperty("GOLD Team")) {
          if (data.teams["GOLD Team"][0] != undefined) {
            const goldTeamCaptianUserName = data.teams["GOLD Team"][0];
            const goldTeamCaptainDiscordId = getUserIdByUserName(data.players, goldTeamCaptianUserName);
            const foundUserGoldTeam = message.guild.members.cache.find((user) => user.id === goldTeamCaptainDiscordId);
            foundUserGoldTeam.roles.add(pickupGameCaptainRole);
          }
        }
        if (firstReadNumber !== secondReadNumber) {
          const timePassedMS = Date.now() - timer.startedAt(); 
          const timePassedSec = Math.floor(timePassedMS / 1000);
          const timePassedMin = (timePassedSec / 60);
          const timeLeft = Math.ceil(35 - timePassedMin);
          blackAndGoldTeamEmbed(message, data, timeLeft, gameStarted);
        }
      })
    }, 1000);
  };
  
  function getUserIdByUserName(players, userName) {
    return Object.keys(players).find(key => players[key] === userName);
  }
  
  function leavePickupGame(message, data, playersListData, blackTeam, goldTeam, authorId, filePath) {
    // if user has pickupCaptain role, remove it 
    if (message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
      message.member.roles.remove(pickupCaptainRoleId);
    }
    if (data.teams.hasOwnProperty("BLACK Team")) {
      if (blackTeam.includes(playersListData[authorId])) {
        const indexOfPlayer = blackTeam.indexOf(playersListData[authorId]);
        blackTeam.splice(indexOfPlayer, 1);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
        });
        return successEmbed(message, "Seeya!", "You've been removed from the BLACK Team");
      }
    }
    if (data.teams.hasOwnProperty("GOLD Team")) {
      if (goldTeam.includes(playersListData[authorId])) {
        const indexOfPlayer = goldTeam.indexOf(playersListData[authorId]);
        goldTeam.splice(indexOfPlayer, 1);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
        });
        return successEmbed(message, "Seeya!", "You've been removed from the GOLD Team");
      }
    }
    return cautionEmbed(message, "Awkward!", "You aren't actually on a team...")
  }
  
  function checkIfUserOnOtherTeam(data, arguments, authorId, message) {
    const userName = data.players[authorId];
    if (arguments[0] === "black" && data.teams["GOLD Team"]) {
      const goldTeam = data.teams["GOLD Team"];
      if (goldTeam.includes(userName)) {
        cautionEmbed(message, "", "You're already on the GOLD Team!");
        return false;
      }
    }
    if (arguments[0] === "gold" && data.teams["BLACK Team"]) {
      const blackTeam = data.teams["BLACK Team"];
      if (blackTeam.includes(userName)) {
        cautionEmbed(message, "", "You're already on the BLACK Team!");
        return false;
      }
    }
    return true;
  }
  
  function checkIfUserIsRegistered(message, playersListData, authorId) {
    if (!playersListData.hasOwnProperty(authorId)) {
      cautionEmbed(message, "", "You need to register before you can play a pickup game!\n Use '!register <userName>' to register!");
      return false;
    }
    return true;
  }
  
  // write a function that counts the length of players on the black team array and the gold team array, if they exist 
  function countPlayersOnBlackAndGoldTeams(data) {
    let blackTeamCount = 0;
    let goldTeamCount = 0;
    if (data.teams.hasOwnProperty("BLACK Team")) {
      blackTeamCount = data.teams["BLACK Team"].length;
    }
    if (data.teams.hasOwnProperty("GOLD Team")) {
      goldTeamCount = data.teams["GOLD Team"].length;
    }
    return blackTeamCount + goldTeamCount;
  }
  


  /////////////// START Pickup Game //////////////////
  
  function startPickupGame2(message, filePath, skipConditions) {
    if(!skipConditions) {
      if (!message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
        return cautionEmbed(
          message,
          "",
          "You need to be a Pickup Game Captain OR both teams must be full in order to start the game!"
        );
      }
    }
    // if user has PickupCaptainRole, make sure both teams exist and that there are at least 1 player on each team.
    readAliasFile(filePath, (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
  
      // teamData = data.teams;
      playerData = data.players;
  
      if (!data.teams.hasOwnProperty("BLACK Team") ||!data.teams.hasOwnProperty("GOLD Team")) {
        return cautionEmbed(
          message,
          "",
          "Both teams need players before you can start the game!"
        );
      }
      if (data.teams.hasOwnProperty("BLACK Team") && data.teams.hasOwnProperty("GOLD Team")) {
        const redTeam = data.teams["BLACK Team"];
        const blueTeam = data.teams["GOLD Team"];
        if (redTeam.length < 1 || blueTeam.length < 1) {
          return cautionEmbed(
            message,
            "",
            "You need to have at least 1 player on each team to start the game!"
          );
        }
      }

      ninetyMinuteTimer2 = setTimeout(() => {
        wipeBlackAndGoldTeams(message, filePath, thirtyFiveMinuteTimer2, ninetyMinuteTimer2);
        ninetyMinuteTimer2 = null;
        gameStarted = false;
      }, 5400000);

     

      gameStarted = true;
      // restart other bot
      restartOtherBot();
  
      // stops the twenty min timer
      clearTimeout(thirtyFiveMinuteTimer2);
      thirtyFiveMinuteTimer2 = null;

      
      // generate pin
    pin = Math.floor(1000 + Math.random() * 9000);

  
      // connects to server and sets new pin.
      connectToServer(server, pin);
  
      // loop through redTeam and getUserIdByUserName. For Each user send DM of the pin.
      const redTeam = data.teams["BLACK Team"];
      redTeam.forEach((userName, index) => {
      const userId = getUserIdByUserName(playerData, userName);


  
        // send DM to user with pin
        message.client.users.fetch(userId).then((user) => {
          if (index === 0) {
            user.send(`-You are a captain for this pickup game.\n-Use "!switchmap <mapname> SND pickup" to pick your map and "!pickupsetup" to start the game!\n-Please Join the "PML Pickup Games" Server\nPickup Game Pin: ${pin}`);
          } else {
            user.send(`Pickup Game servername: PML Pickup Games! [PavlovMasterLeague.com]\nPickup Game Pin: ${pin}`);
          }
        });
      });
      const blueTeam = data.teams["GOLD Team"];
      blueTeam.forEach((user, index) => {
        const userId = getUserIdByUserName(playerData, user);
  
        // send DM to user with pin
        message.client.users.fetch(userId).then((user) => {

          if(index === 0) {
            user.send(`-You are a captain for this pickup game.\n-Use "!switchmap <mapname> SND pickup" to pick your map and "!pickupsetup" to start the game!\n-Please Join the "PML Pickup Games" Server\nPickup Game Pin: ${pin}`);
          } else {
            user.send(`Pickup Game servername: PML Pickup Games! [PavlovMasterLeague.com]\nPickup Game Pin: ${pin}`);
          }
        });
      });
      startPickupGameEmbed(message, "Pickup Game Has Started!", "You've been given specific instructions on how to play this pickup game.");
      blackAndGoldMatchupEmbed(message, "BLACK v. GOLD", data);
    });
  }
  
  

  function connectToServer(server, pin) {
    return new Promise((resolve) => {
      socket = net.Socket();
  
      socket.connect(server.port, server.ip, () => {});
  
      socket.on("error", function (err) {
        console.log(err);
        resolve(socket);
      });
  
      socket.on("data", function (data) {

        if (data.toString().startsWith("Password:")) {
          socket.write(server.password);
        }
        if (data.toString().startsWith("Authenticated=1")) {
          console.log("Logged in!");
          (async () => {
            socket.function = await commandHandler(socket, `setpin ${pin}`);
            if (socket.function.Successful) {
              socket.end();
              socket.destroy();
            }
            return resolve(socket);
          })();
        }
        if (data.toString().startsWith("Authenticated=0")) {
          console.log(data, "RCON login not authenticated!");
        }
      });
    });
  }
  async function commandHandler(socket, command) {
    const try1 = await commandExecute(socket, command);
    if (try1) {
      return try1;
    } else {
      const try2 = await commandExecute(socket, command);
      return try2;
    }
  }
  
  function commandExecute(socket, command) {
    return new Promise((resolve) => {
      socket.write(command);
      socket.once("data", function (data) {
        const dataResult = data.toString();
        try {
          const jsonResult = JSON.parse(dataResult);
          return resolve(jsonResult);
        } catch (e) {
          console.log(e, "Bad rcon Response:", command, dataResult);
          return resolve(null);
        }
      });
    });
  }
  
  // run when someone runs start or auto start happens
  function restartOtherBot() {
    exec(botRebootCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }


  ///////////////////////////////// Wipe Black and Gold Teams /////////////////////////////////

  function wipeBlackAndGoldTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer) {
    const role = message.guild.roles.cache.find(
      (role) => role.id === pickupCaptainRoleId
    );
  
    readAliasFile(filePath, (error, data) => {
      if (error) {
        console.log(error);
      }
  
      if (data.teams["BLACK Team"]) {
        if (data.teams["BLACK Team"][0]) {
          const redTeamCaptain = data.teams["BLACK Team"][0];
  
          const redTeamCaptainUserId = getUserIdByUserName(
            data.players,
            redTeamCaptain
          );
          // remove captainRoleId from redTeamCaptainId
          const foundUser = message.guild.members.fetch(redTeamCaptainUserId);
          role.members.forEach((member) =>
            member.roles.remove(pickupCaptainRoleId)
          );
        }
      }
      if (data.teams["GOLD Team"]) {
        if (data.teams["GOLD Team"][0]) {
          const blueTeamCaptain = data.teams["GOLD Team"][0];
  
          const blueTeamCaptainUserId = getUserIdByUserName(
            data.players,
            blueTeamCaptain
          );
  
          // remove captainRoleId from blueTeamCaptainId
          const foundUser = message.guild.members.fetch(blueTeamCaptainUserId);
          role.members.forEach((member) =>
            member.roles.remove(pickupCaptainRoleId)
          );
        }
      }
      setTimeout(() => {
        delete data.teams["BLACK Team"];
        delete data.teams["GOLD Team"];

        clearTimeout(thirtyFiveMinuteTimer);
        clearTimeout(ninetyMinuteTimer);

        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
          return wipeTeamsEmbed(message, "Teams Wiped: Game Cancelled.");
        });
      }, 500);
    });
  }


  module.exports = {
    pickupGame2,
    wipeBlackAndGoldTeams,
    thirtyFiveMinuteTimer2,
    ninetyMinuteTimer2
  }
  