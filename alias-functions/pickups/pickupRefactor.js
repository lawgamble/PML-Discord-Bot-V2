const fs = require('fs');
const { getAliasData, writeAliasData } = require("../../JSONParser")
const pem = require("../../discord-functions/pickupGameMatchupEmbed")
const em = require("../../discord-functions/generalEmbed");
const rconPlayersListForPickups = require("../../rcon-functions/checkRconUserCount");
const exec = require("child_process").exec;
require("dotenv").config();

const filePath = process.env.ALIASES_FILEPATH;
const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;
const leagueManagerRoleId = process.env.LEAGUE_MANAGER_ROLE_ID;
const pkFilePath = process.env.PICKUP_KICKER_LOG_FILEPATH;

let gameIsActive = false;
let initialized = false;
let data;
let pin;
const { Timer } = require('timer-node');

const botRebootCommand = process.env.BOT_REBOOT_COMMAND;
let preGameTimeout;
let preGameTimer = new Timer();


function pickupGame(message, arguments, command) {
    switch (arguments[0].toLowerCase()) {
        case "red":
        case "blue":

            if (!userIsRegistered(message.author.id)) {
                closure(message, "notRegistered");
                break;
            }

            if (!initialized) initializeGame(message);

            const teamSize = checkTeamSize(arguments[0] === "red" ? "RED Team" : "BLUE Team");

            if (gameIsActive && teamSize === 5) {
                addPlayerToTeam("queue", message);
                break;
            }
            if (teamSize < 5) addPlayerToTeam(arguments[0], message);
            else closure(message, "teamFull", command, arguments[0]);
            break;

        case "leave":
            if (!initialized) return closure(message, "gameNotInitialized");
            leavePickupGame(message.author.id, message);
            break;

        case "start":
            if (!userIsCaptain(message)) return closure(message, "notCaptain", "!pickup start");
            if (!gameIsActive) startGame(message);
            else closure(message, "gameAlreadyStarted");

            break;

        case "teams":
            if (!initialized) return closure(message, "gameNotInitialized");
            sendTeamsEmbed(message);
            break;

        case "end":
            if (userIsCaptain(message)&& gameIsActive) resetPickupGame(message);
            else closure(message, "notLeagueManager", "!pickup end");
            break;

        default:
            closure(message, "notValidCommand", command, arguments[0]);
    }
}


function addPlayerToTeam(teamName, message) {
    if (userOnAnotherTeam(message.author.id)) return closure(message, "userOnAnotherTeam");

     data = getAliasData(filePath);

    if(gameIsActive) gameCodeMessage(null, data.players, message, pin, message.author.id)

    switch (teamName) {
        case "red":
            userName = data.players[message.author.id];
            data.teams["RED Team"].push(userName);
            addCaptainRole(data, "RED Team", userName, message);
            break;

        case "blue":
            userName = data.players[message.author.id];
            data.teams["BLUE Team"].push(userName);
            addCaptainRole(data, "BLUE Team", userName, message);
            break;

        case "queue":
            userName = data.players[message.author.id];
            data.teams["PICKUP Queue"].push(userName);
            em.successEmbed(message, "Queued Up!", "The team is full, so you've been queued up!");
            break;
    }
    writeAliasData(filePath, data);
    sendTeamsEmbed(message);

    if (totalPlayers() === 10) {
        startGame(message);
    }
}

function startGame(message) {
    if(!initialized) return closure(message, "gameNotInitialized");
    data = getAliasData(filePath);
    const redTeam = data.teams["RED Team"];
    const blueTeam = data.teams["BLUE Team"];

    if (redTeam.length === 0 || blueTeam.length === 0) return closure(message, "notEnoughPlayers");

    pin = generatePin();

    redTeam.forEach((user, index) => {
        if (index === 0) captainCodeMessage(user, data.players, message, pin);
        else gameCodeMessage(user, data.players, message, pin)
    });
    blueTeam.forEach((user, index) => {
        if (index === 0) captainCodeMessage(user, data.players, message, pin);
        else gameCodeMessage(user, data.players, message, pin)
    });

    gameIsActive = true;
    clearTimeout(preGameTimeout);
    restartOtherBot();
    pem.redAndBlueMatchupEmbed(message, "RED vs BLUE", data);
    pickupKicker(message);

}

async function resetPickupGame(message) {
    gameIsActive = false;
    preGameTimer.start();
    const rconPlayerList = await rconPlayersListForPickups();
    data = getAliasData(filePath);

    const redTeam = data.teams["RED Team"];
    const blueTeam = data.teams["BLUE Team"];
    const queue = data.teams["PICKUP Queue"];

    redTeam.forEach((user, index) =>  {
        if (!rconPlayerList.includes(user)) {
            data.teams["RED Team"].splice(data.teams["RED Team"].indexOf(user), 1);
            if(index === 0) removeCaptainRole(data, "RED Team", user, message);
        }
    });
    blueTeam.forEach((user, index) =>  {
        if (!rconPlayerList.includes(user)) {
            data.teams["BLUE Team"].splice(data.teams["BLUE Team"].indexOf(user), 1);
            if(index === 0) removeCaptainRole(data, "BLUE Team", user, message);
        }
    });
    movePlayersFromQueue(redTeam, blueTeam, queue, message);
    writeAliasData(filePath, data);

    if(totalPlayers() === 0) return wipeAllTeams(message);

    em.simpleReplyEmbed(message, "The Pickup Game was reset!");
    sendTeamsEmbed(message);
};


function userIsRegistered(discordId) {
    const data = getAliasData(filePath);
    return data.players.hasOwnProperty(discordId);
}

function checkTeamSize(teamName) {
    const data = getAliasData(filePath);
    return data.teams[teamName].length;
}

function totalPlayers() {
    const data = getAliasData(filePath);
    return data.teams["RED Team"].length + data.teams["BLUE Team"].length;
};

function generatePin() {
    return Math.floor(1000 + Math.random() * 9000);
}

function gameCodeMessage(user, players, message, pin, discordId) {
   if (discordId = null || undefined)  discordId = getUserIdByUserName(user, players);
    else message.client.users.fetch(discordId).then((user) => {
        user.send(`Pickup Game servername: PCL Pickup Games! [PavlovMasterLeague.com]\nPickup Game Pin: ${pin}`);
    }).catch((error) => { console.log(error) });

};

function captainCodeMessage(user, players, message, pin) {
    const discordId = getUserIdByUserName(user, players);
    message.client.users.fetch(discordId).then((user) => {
        user.send(`You are a captain for this pickup game.\n-Use "!switchmap <mapname> SND pickup" to pick your map and "!pickupsetup" to start the game!\n-Please Join the "PCL Pickup Games" Server\nPickup Game Pin: ${pin}`);
    }).catch((error) => { console.log(error) });
};

function getUserIdByUserName(user, players) {
    return Object.keys(players).find(key => players[key] === user);
}

function userOnAnotherTeam(discordId) {
    const data = getAliasData(filePath);
    const userName = data.players[discordId];
    return data.teams["RED Team"].includes(userName) || data.teams["BLUE Team"].includes(userName) || data.teams["PICKUP Queue"].includes(userName);
};

function initializeGame(message) {
    data = getAliasData(filePath);
    data.teams["RED Team"] = [];
    data.teams["BLUE Team"] = [];
    data.teams["PICKUP Queue"] = ["q-D1G1TALWraith"];
    initialized = true;
    writeAliasData(filePath, data);
    preGameTimer.start();
    startPreGameTimeout(message);
};

function userIsCaptain(message) {
    if (message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId)) return true;
    else return false;
};

function userIsLeagueManager(message) {
    if (message.member.roles.cache.find((role) => role.id === leagueManagerRoleId)) return true;
    else return false;
};

function leavePickupGame(authorId, message) {
    let team;
    data = getAliasData(filePath);

    const userName = data.players[authorId];
    if (data.teams["RED Team"].includes(userName)) team = "RED Team";
    if (data.teams["BLUE Team"].includes(userName)) team = "BLUE Team";
    if (data.teams["PICKUP Queue"].includes(userName)) team = "PICKUP Queue";

    removeCaptainRole(data, team, userName, message);
    data.teams[team].splice(data.teams[team].indexOf(userName), 1);

    if (team != undefined) em.simpleReplyEmbed(message, `${userName.slice(2)} has left the ${team}`);
    else em.simpleReplyEmbed(message, `${userName.splice(2)} is not on a team`);

    writeAliasData(filePath, data);
    if (totalPlayers() === 0) wipeAllTeams(message)
};

function sendTeamsEmbed(message) {
    const data = getAliasData(filePath);
    const timeLeft = checkPregameTimer(preGameTimer)
    em.redAndBlueTeamEmbed(message, data, timeLeft, gameIsActive);

};

function checkPregameTimer(timer) {
    const timePassedMS = Date.now() - timer.startedAt();
    const timePassedSec = Math.floor(timePassedMS / 1000);
    const timePassedMin = (timePassedSec / 60);
    const timeLeft = Math.ceil(35 - timePassedMin);
    return timeLeft;
};

function startPreGameTimeout(message) {
    preGameTimeout = setTimeout(() => {
        preGameTimer.stop();
        wipeAllTeams(message);
        preGameTimeout = null;
    }, 2100000); // 35 minutes 2100000
};

function wipeAllTeams(message) {
    if (!gameIsActive) {
        const data = getAliasData(filePath);

        if (thereIsACaptain(data, "RED Team")) autoRemoveCaptainRole(data, message); 
        if (thereIsACaptain(data, "BLUE Team")) autoRemoveCaptainRole(data, message); 

        delete data.teams["RED Team"];
        delete data.teams["BLUE Team"];
        delete data.teams["PICKUP Queue"];

        writeAliasData(filePath, data);
        em.simpleReplyEmbed(message, "The Pickup Game has ended. All teams have been wiped.");
        initialized = false;
        preGameTimer.stop();
    }
};

function addCaptainRole(data, team, userName, message) {
    if (data.teams[team][0] === userName) message.member.roles.add(pickupCaptainRoleId);
};

function removeCaptainRole(data, team, userName, message) { 
    if (data.teams[team][0] === userName) {
        const discordId = getUserIdByUserName(userName, data.players);
        message.guild.members.fetch(discordId).then((user) => {
            user.roles.remove(pickupCaptainRoleId);
        }).catch((error) => { console.log(error) });
    }
}

function autoRemoveCaptainRole(data, message) { 
        let discordId = getUserIdByUserName(data.teams["RED Team"][0], data.players);
        console.log(discordId);
        message.guild.members.fetch(discordId).then((user) => {
            user.roles.remove(pickupCaptainRoleId);
        }).catch((error) => { console.log(error) });
   
        discordId = getUserIdByUserName(data.teams["BLUE Team"][0], data.players);
        console.log(discordId);

        message.guild.members.fetch(discordId).then((user) => {
            user.roles.remove(pickupCaptainRoleId);
        }).catch((error) => { console.log(error) });
      
}

// function endPickupGame(message) {
//     gameIsActive = false;
//     wipeAllTeams(message);
// };

function thereIsACaptain(data, team) {
    return data?.teams?.[team]?.[0] !== undefined;
}

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

function closure(message, closureArguments, command, arguments) {
    switch (closureArguments) {
        case "notRegistered":
            em.cautionEmbed(message, "NOT REGISTERED", "You must register with the `!register` command before you can join a team.");
            break;

        case "notValidCommand":
            em.cautionEmbed(message, "NOT VALID COMMAND", `!${command} ${arguments} is not a valid !pickup command!\n **Valid Commands**\n!pickup red \n*puts you on RED Team*\n!pickup blue \n*puts you on BLUE Team*\n!pickup leave \n*removes you from either team*`);
            break;

        case "userOnAnotherTeam":
            em.cautionEmbed(message, "You're already on a team!", "Use `!pickup leave` to leave your current team.");
            break;

        case "teamFull":
            em.cautionEmbed(message, `${arguments.toUpperCase()} Team FULL!`, `The ${arguments.toUpperCase()} Team already has 5 players!`);
            break;

        case "gameAlreadyStarted":
            em.cautionEmbed(message, "GAME ALREADY STARTED", "There's already an active game!");
            break;

        case "gameNotInitialized":
            em.cautionEmbed(message, "GAME NOT INITIALIZED", "There is no active game!");
            break;

        case "notLeagueManager":
            em.cautionEmbed(message, "NOPE!", `You must be a **League Manager** to use the ${command} command.`);
            break;

        case "notCaptain":
            em.cautionEmbed(message, "NOPE!", `You must be a **Pickup Captain** to use the ${command} command.`);
            break;

        case "notEnoughPlayers":
            em.cautionEmbed(message, "NOT ENOUGH PLAYERS", "There are not enough players to start the game.");
            break;
    }
}

/////////////////////////////////////////////////////// Pickup Kicker ///////////////////////////////////////////////////////

let interval;
let removalArray = [[], [], [], [], []];
let checkList = new Set();
let i = 0; // index to push players to removalArray
let j = 1; // index to start kicking players from removalArray

function pickupKicker(message) {
    setTimeout(() => {
      interval = setInterval(() => {
        intervalChecks(message);  
      }, 60000); // 1 min 60000
     }, 15000); // 10 min 300000
    };

    async function intervalChecks(message) {
        if (!gameIsActive) return clearInterval(interval);

        const rconPlayerList = await rconPlayersListForPickups();

        console.log("RCON List:", rconPlayerList, "\n", "Check List:", checkList);
        console.log("j = " + j, "i = " + i, "\n", "RemovalArray:", removalArray);

        data = getAliasData(filePath);

        checkPlayerLists(data.teams["RED Team"], data.teams["BLUE Team"], rconPlayerList);
        kickPlayers(data.teams["RED Team"], data.teams["BLUE Team"], rconPlayerList, data, message);

       const queueNumber = movePlayersFromQueue(data.teams["RED Team"], data.teams["BLUE Team"], data.teams["PICKUP Queue"], message);

        writeAliasData(filePath, data);

        if (totalPlayers() === 0) { gameIsActive = false; return wipeAllTeams(message); };
        
        if(queueNumber > 0) sendTeamsEmbed(message);
    };


function checkPlayerLists(redTeam, blueTeam, rconPlayerList) {
    if (i > 4) i = 0;
    redTeam.forEach((player) => {
        // does rcon list contain the "q-" player? NOOOOOO
         if (!rconPlayerList.includes(player) && !checkList.has(player)) {
            removalArray[i].push(player); checkList.add(player);
        }
    });
    blueTeam.forEach((player) => {
        if (!rconPlayerList.includes(player) && !checkList.has(player)) {
            removalArray[i].push(player); checkList.add(player); 
        }
    });
    i++;
};

function kickPlayers(redTeam, blueTeam, rconPlayerList, data, message) {
    if (j > 4) j = 0;
    if(removalArray[j].length === 0) return j++;
    
    removalArray[j].filter(player => !rconPlayerList.includes(player)).forEach((player) => {
        if(redTeam.includes(player)) redTeam.splice(redTeam.indexOf(player), 1);
        if(blueTeam.includes(player)) blueTeam.splice(blueTeam.indexOf(player), 1);

        logKickedUser(player, data, message);
       
        checkList.delete(player);
        // remove captain role

    });
    removalArray[j] = [];
    j++
};

function movePlayersFromQueue(redTeam, blueTeam, pickupQueue, message) {
    let queueNumber = 0;
    let player;
    if(pickupQueue.length === 0) return;

    while (pickupQueue.length > 0 && (redTeam.length < 5 || blueTeam.length < 5)) {
        if(redTeam.length < 5) { 
            player = pickupQueue.shift();
            redTeam.push(player);
            if(gameIsActive) gameCodeMessage(player, data.players, message, pin, null)
            else gameResetMessage(data, player, message)
            queueNumber++; 
        }
        else if(blueTeam.length < 5) {
            player = pickupQueue.shift();
            blueTeam.push(player); 
            if(gameIsActive) gameCodeMessage(player, data.players, message, pin, null)
            else gameResetMessage(data, player, message)
            queueNumber++; 
        } 
    }
    return queueNumber;
};

function logKickedUser(player, data, message) {
    const userDiscordId = getUserIdByUserName(player, data.players);
    const date = new Date().toLocaleString();
    const log = `${date} - ${userDiscordId} - ${player}\n`;
    fs.appendFile(pkFilePath, log, (error) => {
        if (error) {
            console.log(error);
        }
    });
    
}

function gameResetMessage(data, player, message) {
    const userDiscordId = getUserIdByUserName(player, data.players);
    message.guild.members.fetch(userDiscordId).then((user) => {
        user.send(`The Pickup game that you were in queue for was ended by a captain. You've been added to a Pickup team and I'll let you know when the next Pickup game starts.\n**Check the Pickup channel to see your current team or to leave the the pickup if you can't play anymore.**`);
    })
    
};

function letTheWorldKnow(userDiscordId, message) {
    message.channel.send(
        `<@${userDiscordId}> was kicked from the pickup game due to inactivity.`
    );
}


module.exports = pickupGame;