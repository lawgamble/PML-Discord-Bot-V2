
  const fs = require("fs");
  const net = require("net");
  const { Timer } = require('timer-node');
  const readAliasFile = require("../../JSONParser");
  const checkInactivePlayers = require("./removeInactivePlayers")
  const connectToServer = require("./rcon")
  const em = require("../../discord-functions/generalEmbed");
  const pem = require("../../discord-functions/pickupGameMatchupEmbed");
  const phf = require("./pickupHelperFunctions");
const hf = require("../../helperFunctions");
 
  
  const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;
  
  
  const teamFilter = ["red", "blue"];
  const otherArgumentsFilter = ["leave", "teams"];
  
  
  let thirtyFiveMinuteTimer;
  let ninetyMinuteTimer;
  let teamName;
  let playerToAdd;
  let firstReadNumber;
  let secondReadNumber;
  let pin;
 
  
  let playerData;
  let gameStarted = false;
  const timer = new Timer();

const serverPort = process.env.SERVER_PORT;
const serverIp = process.env.PICKUP_SERVER_IP;
const serverPassword = process.env.SERVER_PASSWORD;
//const pickupChannelId = process.env.PICKUP_CHANNEL_ID;

let socket = {};

const server = {
  port: serverPort,
  ip: serverIp,
  password: serverPassword,
};
  
  function pickupGame(filePath, message, arguments, command) {
   
    if(gameStarted && arguments[0] === "start") return em.cautionEmbed(message, "", "A game is already in progress!");

    if(!gameStarted && arguments[0] === "end") return em.cautionEmbed(message, "", "There is no game currently running!"); 

   // if(gameStarted && arguments[0] !== "end") return em.cautionEmbed(message, "", "The Pickup Game has already started!\nYou can't make any commands other than '!pickup end' while a game is running.");

    if(gameStarted && arguments[0] === "end") {
      return phf.stopPickupGame(message, ninetyMinuteTimer, thirtyFiveMinuteTimer, gameStarted, filePath, timer);
    } 

    // startPickup game args are the message, the filePath and if conditions should be skipped
     if(arguments[0] === "start") {
       return startPickupGame(message, filePath, false);
     }


    const pickupGameCaptainRole = message.guild.roles.cache.find(role => role.id === pickupCaptainRoleId);
    const authorId = message.author.id;
  
    // check if valid argument first.
    if (!otherArgumentsFilter.includes(arguments[0]?.toLowerCase()) && !teamFilter.includes(arguments[0]?.toLowerCase())) {
      return em.cautionEmbed(
        message,
        "", `!${command} ${arguments[0]} is not a valid !pickup command!\n **Valid Commands**\n!pickup red \n*puts you on RED Team*\n!pickup blue \n*puts you on BLUE Team*\n!pickup leave \n*removes you from either team*`
      );
    }
  
    // if argument is red or blue, change team name to argument.
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
  
      firstReadNumber = countPlayersOnRedAndBlueTeams(data);
  
      // creates embed of the teams when command === "teams"
      if (arguments[0].toLowerCase() === "teams") {
        if (data.teams.hasOwnProperty("RED Team") || data.teams.hasOwnProperty("BLUE Team")) {
          const timePassedMS = Date.now() - timer.startedAt(); 
          const timePassedSec = Math.floor(timePassedMS / 1000);
          const timePassedMin = (timePassedSec / 60);
          const timeLeft = Math.ceil(35 - timePassedMin);
          em.redAndBlueTeamEmbed(message, data, timeLeft, gameStarted);
        }
        else {
          em.simpleReplyEmbed(message, "No Pickup Games Found")
        }
        return;
      }
  
      // check if player wants to leave
      if (arguments[0].toLowerCase() === "leave") {
        return leavePickupGame(message, data, playersListData, blueTeam = data.teams["BLUE Team"], redTeam = data.teams["RED Team"], authorId, filePath);
      }
  
      // check if user is registered
      if (checkIfUserIsRegistered(message, playersListData, authorId)) {
        playerToAdd = playersListData[authorId];
      }
      else {
        return;
      }
  
      // if neither team exists on initial read, set 20 min timer
      if (!data.teams.hasOwnProperty("RED Team") && !data.teams.hasOwnProperty("BLUE Team")) {
        timer.start();
        thirtyFiveMinuteTimer = setTimeout(() => {
          phf.wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer);
          timer.stop();
          thirtyFiveMinuteTimer = null;
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
            // restart other bot
            phf.restartOtherBot();
          }
        }
        else {
          em.cautionEmbed(message, "No-Can-Do!", `The ${arguments[0].toUpperCase()} Team already has 5 players!`);
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
        secondReadNumber = countPlayersOnRedAndBlueTeams(data);

        // if teams are full, start the game automatically
        if (secondReadNumber === 10 && gameStarted === false) return startPickupGame(message, filePath, true);
  
        // if users leave and teams are empty, cancel the Pickup Game and timer.
        if (arguments[0].toLowerCase() === "leave") {
          if (secondReadNumber === 0 && data.teams["RED Team"] || secondReadNumber === 0 && data.teams["BLUE Team"]) {
            clearTimeout(thirtyFiveMinuteTimer);
            thirtyFiveMinuteTimer = null;
            timer.stop();
            return phf.wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer);
          }
        }
  
        if (data.teams.hasOwnProperty("RED Team")) {
          if (data.teams["RED Team"][0] != undefined) {
            const redTeamCaptianUserName = data.teams["RED Team"][0];
            const redTeamCaptainDiscordId = getUserIdByUserName(data.players, redTeamCaptianUserName);
            const foundUserRedTeam = message.guild.members.cache.find((user) => user.id === redTeamCaptainDiscordId);
            foundUserRedTeam.roles.add(pickupGameCaptainRole);
          };
        }
        if (data.teams.hasOwnProperty("BLUE Team")) {
          if (data.teams["BLUE Team"][0] != undefined) {
            const blueTeamCaptianUserName = data.teams["BLUE Team"][0];
            const blueTeamCaptainDiscordId = getUserIdByUserName(data.players, blueTeamCaptianUserName);
            const foundUserBlueTeam = message.guild.members.cache.find((user) => user.id === blueTeamCaptainDiscordId);
            foundUserBlueTeam.roles.add(pickupGameCaptainRole);
          }
        }
        if (firstReadNumber !== secondReadNumber) {
          const timePassedMS = Date.now() - timer.startedAt(); 
          const timePassedSec = Math.floor(timePassedMS / 1000);
          const timePassedMin = (timePassedSec / 60);
          const timeLeft = Math.ceil(35 - timePassedMin);
          em.redAndBlueTeamEmbed(message, data, timeLeft, gameStarted);
        }
      })
    }, 1000); 
  };
   










  function getUserIdByUserName(players, userName) {
    return Object.keys(players).find(key => players[key] === userName);
  }
  
  function leavePickupGame(message, data, playersListData, blueTeam, redTeam, authorId, filePath) {
    // if user has pickupCaptain role, remove it 
    if (message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
      message.member.roles.remove(pickupCaptainRoleId);
    }
    if (data.teams.hasOwnProperty("RED Team")) {
      if (redTeam.includes(playersListData[authorId])) {
        const indexOfPlayer = redTeam.indexOf(playersListData[authorId]);
        redTeam.splice(indexOfPlayer, 1);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
        });
        return em.successEmbed(message, "Seeya!", "You've been removed from the RED Team");
      }
    }
    if (data.teams.hasOwnProperty("BLUE Team")) {
      if (blueTeam.includes(playersListData[authorId])) {
        const indexOfPlayer = blueTeam.indexOf(playersListData[authorId]);
        blueTeam.splice(indexOfPlayer, 1);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
          if (error) {
            console.log(error);
          }
        });
        return em.successEmbed(message, "Seeya!", "You've been removed from the BLUE Team");
      }
    }
    return em.cautionEmbed(message, "Awkward!", "You aren't actually on a team...")
  }
  
  function checkIfUserOnOtherTeam(data, arguments, authorId, message) {
    const userName = data.players[authorId];
    if (arguments[0] === "red" && data.teams["BLUE Team"]) {
      const blueTeam = data.teams["BLUE Team"];
      if (blueTeam.includes(userName)) {
        em.cautionEmbed(message, "", "You're already on the BLUE Team!");
        return false;
      }
    }
    if (arguments[0] === "blue" && data.teams["RED Team"]) {
      const redTeam = data.teams["RED Team"];
      if (redTeam.includes(userName)) {
        em.cautionEmbed(message, "", "You're already on the RED Team!");
        return false;
      }
    }
    return true;
  }
  
  function checkIfUserIsRegistered(message, playersListData, authorId) {
    if (!playersListData.hasOwnProperty(authorId)) {
      em.cautionEmbed(message, "", "You need to register before you can play a pickup game!\n Use '!register <userName>' to register!");
      return false;
    }
    return true;
  }
  
  // write a function that counts the length of players on the blue team array and the red team array, if they exist 
  function countPlayersOnRedAndBlueTeams(data) {
    let redTeamCount = 0;
    let blueTeamCount = 0;
    if (data.teams.hasOwnProperty("RED Team")) {
      redTeamCount = data.teams["RED Team"].length;
    }
    if (data.teams.hasOwnProperty("BLUE Team")) {
      blueTeamCount = data.teams["BLUE Team"].length;
    }
    return redTeamCount + blueTeamCount;
  }
  


  /////////////// START Pickup Game //////////////////
  
  function startPickupGame(message, filePath, skipConditions) {
    if(!skipConditions) {
      if (!message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
        return em.cautionEmbed(
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
  
      if (!data.teams.hasOwnProperty("RED Team") ||!data.teams.hasOwnProperty("BLUE Team")) {
        return em.cautionEmbed(
          message,
          "",
          "Both teams need players before you can start the game!"
        );
      }
      if (data.teams.hasOwnProperty("RED Team") && data.teams.hasOwnProperty("BLUE Team")) {
        const redTeam = data.teams["RED Team"];
        const blueTeam = data.teams["BLUE Team"];
        if (redTeam.length < 1 || blueTeam.length < 1) {
          return em.cautionEmbed(
            message,
            "",
            "You need to have at least 1 player on each team to start the game!"
          );
        }
      }

      ninetyMinuteTimer = setTimeout(() => {
        phf.wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer);
        ninetyMinuteTimer = null;
        gameStarted = false;
      }, 5400000);

     

      gameStarted = true;
    
      phf.restartOtherBot();
  
      // stops the twenty min timer
      clearTimeout(thirtyFiveMinuteTimer);
      thirtyFiveMinuteTimer = null;

      
      // generate pin
      pin = Math.floor(1000 + Math.random() * 9000);

  
      // connects to server and sets new pin.
      connectToServer(server, pin);
  
      // loop through redTeam and getUserIdByUserName. For Each user send DM of the pin.
      const redTeam = data.teams["RED Team"];
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
      const blueTeam = data.teams["BLUE Team"];
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

      em.startPickupGameEmbed(message, "Pickup Game Has Started!", "You've been given specific instructions on how to play this pickup game.");
      pem.redAndBlueMatchupEmbed(message, "RED v. BLUE", data);

      
      // create QUEUE Team
      data.teams = {...data.teams, "PICKUP Queue": ["q-XxPunisher78xX"]};

      fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
          console.log(error);
        }
      });
      pickupKicker(filePath, gameStarted, message, hf);
    });
  }

  // starts after 5 minutes, checks every 1 min interval.
  function pickupKicker(filePath, gameStarted, message) {
  setTimeout(() => {
    const interval = setInterval(() => {

      
      const data = readAliasData(filePath);
      gameEnded = checkIfGameEnded(data)
        checkInactivePlayers(filePath, data, message);
        if(!gameStarted || gameEnded === true) {
        phf.wipeRedAndBlueTeams(message, filePath, thirtyFiveMinuteTimer, ninetyMinuteTimer)
        clearInterval(interval);
        return;
      }
      
    }, 15000); // 1 min
  }, 5000); // 5 min
}

function checkIfGameEnded(data) {
  const redTeam = data.teams["RED Team"];
  const blueTeam = data.teams["BLUE Team"];
  if (redTeam.length === 0 || blueTeam.length === 0) {
    return true;
  } else {
    return false;
  }
}
  

function readAliasData(filePath) {
  const aliases = fs.readFileSync(filePath);
  const data = JSON.parse(aliases);
  return data;
}

function writeAliasesData(filePath, data) {
  return fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const pg = {
  pickupGame,
  thirtyFiveMinuteTimer,
  ninetyMinuteTimer,
  gameStarted,
}


  module.exports = pg;
  