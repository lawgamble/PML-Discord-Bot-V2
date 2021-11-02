
  const fs = require("fs");
  const net = require("net");
  const exec = require("child_process").exec;
  const readAliasFile = require("./JSONParser");
  const {
    cautionEmbed,
    successEmbed,
    pickupGameTeamEmbed,
    simpleReplyEmbed
  } = require("../discord-functions/generalEmbed");
 
  const wipeRedAndBlueTeams = require("./wipeRedAndBlueTeams");
  const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;
  
  const teamFilter = ["red", "blue"];
  const otherArgumentsFilter = ["leave", "teams", "end"];
  const botRebootCommand = process.env.BOT_REBOOT_COMMAND;
  
  
  let twentyMinuteTimer;
  let ninetyMinuteTimer;
  let teamName;
  let playerToAdd;
  let firstReadNumber;
  let secondReadNumber;
  let teamData;
  let playerData;
  let gameStarted = false;

const serverPort = process.env.SERVER_PORT;

const serverIp = process.env.PICKUP_SERVER_IP;

const serverPassword = process.env.SERVER_PASSWORD;

let socket = {};

const server = {
  port: serverPort,
  ip: serverIp,
  password: serverPassword,
};
  
  function pickupGame(filePath, message, arguments, command) {


    if(!gameStarted && arguments[0] === "end") return cautionEmbed(message, "", "There is no game currently running!"); 

    if(gameStarted && arguments[0] !== "end") return cautionEmbed(message, "", "The game has already started, dumbass...");

    if(gameStarted && arguments[0] === "end") {
      if(message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) {
        gameStarted = false;
        clearTimeout(ninetyMinuteTimer);
        wipeRedAndBlueTeams(message, filePath);
        return;
      }
    } 

     if(arguments[0] === "start") {
       // startPickup game args are the message, the filePath and if conditions should be skipped
       return startPickupGame(message, filePath, false);
     }


    const pickupGameCaptainRole = message.guild.roles.cache.find(role => role.id === pickupCaptainRoleId);
    const authorId = message.author.id;
  
    // check if valid argument first.
    if (!otherArgumentsFilter.includes(arguments[0]?.toLowerCase()) && !teamFilter.includes(arguments[0]?.toLowerCase())) {
      return cautionEmbed(
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
          pickupGameTeamEmbed(message, data);
        }
        else {
          simpleReplyEmbed(message, "No Pickup Games Found")
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
    
        twentyMinuteTimer = setTimeout(() => {
          wipeRedAndBlueTeams(message, filePath);
        }, 1200000);
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
        if (data.teams[teamName].length < 5 && gameStarted === false) {
          data.teams[teamName].push(playerToAdd);
          data.teams[teamName] = [...new Set(data.teams[teamName])];
        }
        else {
          cautionEmbed(message, "No-Can-Do!", `The ${arguments[0].toUpperCase()} Team already has 5 players or the game has already started!`);
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
        if (secondReadNumber === 10) return startPickupGame(message, filePath, true);
  
        // if users leave and teams are empty, cancel the Pickup Game and timer.
        if (arguments[0].toLowerCase() === "leave") {
          if (secondReadNumber === 0 && data.teams["RED Team"] || secondReadNumber === 0 && data.teams["BLUE Team"]) {
            clearTimeout(twentyMinuteTimer);
            return wipeRedAndBlueTeams(message, filePath);
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
          pickupGameTeamEmbed(message, data);
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
        return successEmbed(message, "Seeya!", "You've been removed from the RED Team");
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
        return successEmbed(message, "Seeya!", "You've been removed from the BLUE Team");
      }
    }
    return cautionEmbed(message, "Awkward!", "You aren't actually on a team...")
  }
  
  function checkIfUserOnOtherTeam(data, arguments, authorId, message) {
    const userName = data.players[authorId];
    if (arguments[0] === "red" && data.teams["BLUE Team"]) {
      const blueTeam = data.teams["BLUE Team"];
      if (blueTeam.includes(userName)) {
        cautionEmbed(message, "", "You're already on the BLUE Team!");
        return false;
      }
    }
    if (arguments[0] === "blue" && data.teams["RED Team"]) {
      const redTeam = data.teams["RED Team"];
      if (redTeam.includes(userName)) {
        cautionEmbed(message, "", "You're already on the RED Team!");
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
  
      if (
        !data.teams.hasOwnProperty("RED Team") ||
        !data.teams.hasOwnProperty("BLUE Team")
      ) {
        return cautionEmbed(
          message,
          "",
          "Both teams need players before you can start the game!"
        );
      }
      if (
        data.teams.hasOwnProperty("RED Team") &&
        data.teams.hasOwnProperty("BLUE Team")
      ) {
        const redTeam = data.teams["RED Team"];
        const blueTeam = data.teams["BLUE Team"];
        if (redTeam.length < 1 || blueTeam.length < 1) {
          return cautionEmbed(
            message,
            "",
            "You need to have at least 1 player on each team to start the game!"
          );
        }
      }

      gameStarted = true;
      // restart other bot
      restartOtherBot();
  
      // stops the twenty min timer
      clearTimeout(twentyMinuteTimer);
      // generate pin
      let pin = Math.floor(1000 + Math.random() * 9000);

  
      // connects to server and sets new pin.
      connectToServer(server, pin);
  
      // loop through redTeam and getUserIdByUserName. For Each user send DM of the pin.
      const redTeam = data.teams["RED Team"];
      redTeam.forEach((userName, index) => {
        const userId = getUserIdByUserName(playerData, userName);
  
        // send DM to user with pin
        message.client.users.fetch(userId).then((user) => {
          if (index === 0) {
            user.send(`Use !pickupstart to start the game!\n Pickup Game Pin: ${pin}`);
          } else {
            user.send(`Pickup Game Pin: ${pin}`);
          }
        });
      });
      const blueTeam = data.teams["BLUE Team"];
      blueTeam.forEach((user, index) => {
        const userId = getUserIdByUserName(playerData, user);
  
        // send DM to user with pin
        message.client.users.fetch(userId).then((user) => {

          if (index === 0) {
            user.send(`Pickup Game Pin: ${pin}\nUse !pickupstart to start the game!`);
          } else {
            user.send(`Pickup Game Pin: ${pin}`);
          }
        });
      });
    });
    ninetyMinuteTimer = setTimeout(() => {
      wipeRedAndBlueTeams(message, filePath, ninetyMinuteTimer);
    }, 5400000);
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
  
  module.exports =  pickupGame;
  