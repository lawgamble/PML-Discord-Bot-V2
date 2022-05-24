
const {
    getAliasData,
    writeAliasData
} = require("../../JSONParser")
const pem = require("../../discord-functions/pickupGameMatchupEmbed")
const em = require("../../discord-functions/generalEmbed");
const {
    rconPlayersListForPickups,
    changePin
} = require("../../rcon-functions/checkRconUserCount");
const exec = require("child_process").exec;
const {
    voter
} = require("./voter")
const switchWithPlayer = require("./swapper")
const Discord = require("discord.js");
require("dotenv").config();

const filePath = process.env.ALIASES_FILEPATH;
const pickupCaptainRoleId = process.env.PICKUP_CAPTAIN_ROLE_ID;
const replayChannelID = process.env.REPLAY_CHANNEL_ID;
const replayRoleID = process.env.REPLAY_ROLE_ID;

let gameIsActive = false;
let gameResetting = false;
let initialized = false;
let data;
let pin;
const {
    Timer
} = require('timer-node');

const server = {
    port: process.env.SERVER_PORT,
    ip: process.env.PICKUP_SERVER_IP,
    password: process.env.SERVER_PASSWORD,
};

const botRebootCommand = process.env.BOT_REBOOT_COMMAND;
let preGameTimeout;
let preGameTimer = new Timer();


function pickupGame(message, arguments, command, buttons) {
    if (arguments[0] === undefined)  return closure(message, "noArgument")
    switch (arguments[0].toLowerCase()) {
        case "red":
        case "blue":

            if (!userIsRegistered(message.author.id)) {
                closure(message, "notRegistered");
                break;
            }

            if (!initialized) initializeGame(message);

            // this is going check if the game is being reset
            //if(gameIsbeingReset()) return addPlayerToTeam("queue", message);
            if (gameResetting) {
                //addPlayerToTeam("queue", message)

                return addPlayerToTeam("queue", message);
            } 

            const teamSize = checkTeamSize(arguments[0] === "red" ? "RED Team" : "BLUE Team");

            if (gameIsActive && teamSize === 5) {
                addPlayerToTeam("queue", message);
                sendTeamsEmbed(message);
                break;
            }
            if (teamSize < 5) addPlayerToTeam(arguments[0].toLowerCase(), message);
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
            if (userIsCaptain(message) && !gameIsActive) {
                closure(message, "noActiveGame");
                break;
            }
            if (userIsCaptain(message) && gameIsActive) resetPickupGame(message).catch(e => console.log(e));
            else closure(message, "notCaptain", "!pickup end");

            break;

        case "vote":
            voter(message)

            break;

        case "switch":
           data = switchWithPlayer(message, buttons).catch(e => console.log(e));
            break;

        case "rcon":
            getRconPlayersList(message).catch(e => console.log(e));
            break;

        default:
            closure(message, "notValidCommand", command, arguments[0]);
    }
}


function addPlayerToTeam(teamName, message) {
    let userName;
    if (userOnAnotherTeam(message.author.id)) return closure(message, "userOnAnotherTeam");

    data = getAliasData(filePath);

    if (gameIsActive && teamName !== "queue") gameCodeMessage(null, data.players, message, pin, message.author.id)

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
            data = writeAliasData(filePath, data)
            em.successEmbed(message, "Queued Up!", "The team is full, so you've been queued up!");

            break;
    }


    data = writeAliasData(filePath, data);

    let sumOfPlayers = totalPlayers(data);
    if (sumOfPlayers < 10) sendTeamsEmbed(message);

    if (sumOfPlayers === 10 && !gameIsActive) {
        startGame(message);
    }
}

function startGame(message) {
    if (!initialized) return closure(message, "gameNotInitialized");
    data = getAliasData(filePath);

    const redTeam = data.teams["RED Team"];
    const blueTeam = data.teams["BLUE Team"];

    if (redTeam.length === 0 || blueTeam.length === 0) return closure(message, "notEnoughPlayers");

    pin = generatePin();

    redTeam.forEach((user, index) => {
        switch (index) {
            case 0:
                captainCodeMessage(user, data.players, message, pin);
                break;
            default:
                gameCodeMessage(user, data.players, message, pin, null);
                break;
        }
    });
    blueTeam.forEach((user, index) => {
        switch (index) {
            case 0:
                captainCodeMessage(user, data.players, message, pin);
                break;
            default:
                gameCodeMessage(user, data.players, message, pin, null);
                break;
        }
    });

    changePin(server, pin).catch(e => console.log(e))

    gameIsActive = true;
    clearTimeout(preGameTimeout);
    restartOtherBot();
    em.startPickupGameEmbed(message, "``Pickup Game Has Started``", "Check you DM's for specific instructions on how to play this pickup game.");
    pem.redAndBlueMatchupEmbed(message, "RED vs BLUE", data);
}

async function resetPickupGame(message) {
    gameIsActive = false;

    // maybe move this inside the set timeout below and remove any setTimeout in the makePickupGame function
    await makePickupGameResetEmbed(message);

    resetPreGameTimers();

    startPreGameTimers(message);

    gameResetting = true;
    em.successEmbedNoReply(message, "Game Resetting", "The game will be reset in 2 minutes.\nIf you join a team, you will be added to the queue in the order you joined.");

    setTimeout(() => {
        gameResetting = false;
        em.successEmbedNoReply(message, "Pickups is LIVE!", "Have fun!");

       data = writeAliasData(filePath, data);

        movePlayersFromQueue(data, message);

        data =  writeAliasData(filePath, data);

        sendTeamsEmbed(message);

        if (totalPlayers(data) === 0) return wipeAllTeams(message);

        if (totalPlayers(data) >= 10 && !gameIsActive) {
            startGame(message);
        }

    }, 120000);
    
}


function userIsRegistered(discordId) {
    data = getAliasData(filePath);
    return data.players.hasOwnProperty(discordId);
}

function checkTeamSize(teamName) {
    data = getAliasData(filePath);
    return data.teams[teamName].length;
}

function totalPlayers(data) {
    return data.teams["RED Team"].length + data.teams["BLUE Team"].length + data.teams["PICKUP Queue"].length;
}

function generatePin() {
    return Math.floor(1000 + Math.random() * 9000);
}

function gameCodeMessage(user, players, message, pin, discordId) {
    if (discordId === null || undefined) discordId = getUserIdByUserName(user, players);

    message.client.users.fetch(discordId).then((user) => {
        user.send(`Pickup Game servername: PCL Pickup Games! [PavlovMasterLeague.com]\nPickup Game Pin: ${pin}`).catch(e => console.log(e));
    })

}

function captainCodeMessage(user, players, message, pin) {
    const discordId = getUserIdByUserName(user, players);

    message.client.users.fetch(discordId).then((user) => {
        user.send(`You are a captain for this pickup game.\n-Use "!switchmap <mapname> SND pickup" to pick your map and "!pickupsetup" to start the game!\n-Please Join the "PCL Pickup Games" Server\nPickup Game Pin: ${pin}`).catch(e => console.log(e));
    })
}

function getUserIdByUserName(user, players) {
    return Object.keys(players).find(key => players[key] === user);
}

function userOnAnotherTeam(discordId) {
    data = getAliasData(filePath);
    const userName = data.players[discordId];
    return data.teams["RED Team"].includes(userName) || data.teams["BLUE Team"].includes(userName) || data.teams["PICKUP Queue"].includes(userName);
}

function initializeGame(message) {
    data = getAliasData(filePath);
    data.teams["RED Team"] = [];
    data.teams["BLUE Team"] = [];
    data.teams["PICKUP Queue"] = [];
    initialized = true;
    data = writeAliasData(filePath, data);
    startPreGameTimers(message);
}

function userIsCaptain(message) {
    return !!message.member.roles.cache.find((role) => role.id === pickupCaptainRoleId);
}


function leavePickupGame(authorId, message) {
    let team;
    data = getAliasData(filePath);

    const userName = data.players[authorId];

    if (!userOnAnotherTeam(authorId)) return closure(message, "notOnATeam");

    if (data.teams["RED Team"].includes(userName)) team = "RED Team";
    if (data.teams["BLUE Team"].includes(userName)) team = "BLUE Team";
    if (data.teams["PICKUP Queue"].includes(userName)) team = "PICKUP Queue";

    if ((team === "RED Team" || team === "BLUE Team") && data.teams[team].indexOf(userName) === 0) {
        removeCaptainRole(data, team, userName, message);

        if (data.teams[team].length > 1) {
            makeNewCaptain(data, team, message);
        }
    }

    data.teams[team].splice(data.teams[team].indexOf(userName), 1);

    if (team !== undefined) em.simpleReplyEmbed(message, `${userName.slice(2)} has left the ${team}`);
    else em.simpleReplyEmbed(message, `${userName.slice(2)} is not on a team`);

    data = writeAliasData(filePath, data);

    if (data.teams["PICKUP Queue"].length > 0) {
        movePlayersFromQueue(data, message);
    }

    if (totalPlayers(data) === 0) return wipeAllTeams(message)
    sendTeamsEmbed(message);
}

function sendTeamsEmbed(message) {
    data = getAliasData(filePath);
    const timeLeft = checkPregameTimer(preGameTimer)
    em.redAndBlueTeamEmbed(message, data, timeLeft, gameIsActive);
}

function checkPregameTimer(timer) {
    const timePassedMS = Date.now() - timer.startedAt();
    const timePassedSec = Math.floor(timePassedMS / 1000);
    const timePassedMin = (timePassedSec / 60);
    return Math.ceil(35 - timePassedMin);
}

function startPreGameTimers(message) {
    preGameTimer.start();

    preGameTimeout = setTimeout(() => {
        wipeAllTeams(message);
        resetPreGameTimers();
    }, 2100000); // 35 minutes 2100000
}


function resetPreGameTimers() {
    if (preGameTimeout !== null) {
        clearTimeout(preGameTimeout);
        preGameTimeout = null;
    }
    preGameTimer.stop();
}

function wipeAllTeams(message) {
    if (!gameIsActive) {
        data = getAliasData(filePath);

        if (thereIsACaptain(data, "RED Team")) autoRemoveCaptainRole(data, message);
        if (thereIsACaptain(data, "BLUE Team")) autoRemoveCaptainRole(data, message);

        delete data.teams["RED Team"];
        delete data.teams["BLUE Team"];
        delete data.teams["PICKUP Queue"];

        data = writeAliasData(filePath, data);
        em.simpleReplyEmbed(message, "All teams have been wiped.");
        initialized = false;
        resetPreGameTimers();
    }
}

function addCaptainRole(data, team, userName, message) {
    if (data.teams[team][0] === userName) message.member.roles.add(pickupCaptainRoleId);
}

function makeNewCaptain(data, team, message) {
    const newCaptain = data.teams[team][1];
    const user = getUserIdByUserName(newCaptain, data.players);
    message.guild.members.fetch(user).then((user) => {
        user.roles.add(pickupCaptainRoleId);
    }).catch((error) => {
        console.log("MakeNewCaptain", error)
    });
}

function removeCaptainRole(data, team, userName, message) {
    if (data.teams[team][0] === userName) {
        const discordId = getUserIdByUserName(userName, data.players);
        message.guild.members.fetch(discordId).then((user) => {
            user.roles.remove(pickupCaptainRoleId);
        }).catch((error) => {
            console.log(error)
        });
    }
}

function autoRemoveCaptainRole(data, message) {
    const discordIdRed = getUserIdByUserName(data.teams["RED Team"][0], data.players);
    message.guild.members.fetch(discordIdRed).then((user) => {
        if (user.roles.cache.has(pickupCaptainRoleId)) user.roles.remove(pickupCaptainRoleId);
    }).catch((error) => {
        console.log(error)
    });

    const discordIdBlue = getUserIdByUserName(data.teams["BLUE Team"][0], data.players);
    message.guild.members.fetch(discordIdBlue).then((user) => {
        if (user.roles.cache.has(pickupCaptainRoleId)) user.roles.remove(pickupCaptainRoleId);
    }).catch((error) => {
        console.log(error)
    });

}


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
            em.cautionEmbed(message, "``NOT REGISTERED``", "You must register with the `!register` command before you can join a team.");
            break;

        case "notValidCommand":
            em.cautionEmbed(message, "``NOT VALID COMMAND``", `!${command} ${arguments} is not a valid !pickup command!\n` + "**Valid Commands**\n``!pickup red`` *puts you on RED Team*\n``!pickup blue`` *puts you on BLUE Team*\n``!pickup leave`` *removes you from either team*\n``!pickup teams`` *shows you the current lineup*");
            break;

        case "userOnAnotherTeam":
            em.cautionEmbed(message, "``YOU'RE ALREADY ON A TEAM``", "Use `!pickup leave` to leave your current team.");
            break;

        case "teamFull":
            em.cautionEmbed(message, `${arguments.toUpperCase()} Team FULL!`, `The ${arguments.toUpperCase()} Team already has 5 players!`);
            break;

        case "gameAlreadyStarted":
            em.cautionEmbed(message, "``GAME ALREADY STARTED``", "There's already an active game!");
            break;

        case "gameNotInitialized":
            em.cautionEmbed(message, "``GAME NOT INITIALIZED``", "There is no active game!");
            break;

        case "notLeagueManager":
            em.cautionEmbed(message, "``NOT A LEAGUE MANAGER``!", `You must be a **League Manager** to use the ${command} command.`);
            break;

        case "notCaptain":
            em.cautionEmbed(message, "``NOT A CAPTAIN``", `You must be a **Pickup Captain** to use the ${command} command.`);
            break;

        case "notEnoughPlayers":
            em.cautionEmbed(message, "``NOT ENOUGH PLAYERS``", "There are not enough players to start the game.");
            break;

        case "noActiveGame":
            em.cautionEmbed(message, "``NO ACTIVE GAME``", "There is no active game!");
            break;

        case "notOnATeam":
            em.cautionEmbed(message, "``NOT ON A TEAM``", "You must be on a team to use this command.");
            break;

        case "noArgument":
            em.cautionEmbed(message, "``NO ARGUMENT:``", "You must use a VALID pickup command.");
            break;
    }
}



function movePlayersFromQueue(data, message) {
    if (data.teams["PICKUP Queue"].length === 0) return;
    let queueNumber = 0;
    let player;

    while (data.teams["PICKUP Queue"].length > 0 && (data.teams["RED Team"].length < 5 || data.teams["BLUE Team"].length < 5)) {
        if (data.teams["RED Team"].length < 5) {
            if (data.teams["PICKUP Queue"].length === 0) return;
            player = data.teams["PICKUP Queue"].shift();
            data.teams["RED Team"].push(player);
            if (gameIsActive) gameCodeMessage(player, data.players, message, pin, null)
            else gameResetMessage(data, player, message)
            queueNumber++;
        }
        if (data.teams["BLUE Team"].length < 5) {
            if (data.teams["PICKUP Queue"].length === 0) return;
            player = data.teams["PICKUP Queue"].shift();
            data.teams["BLUE Team"].push(player);
            if (gameIsActive) gameCodeMessage(player, data.players, message, pin, null)
            else gameResetMessage(data, player, message)
            queueNumber++;
        }
    }
    data = writeAliasData(filePath, data);
    makeSureTeamsHaveCaptains(message, data)
    return queueNumber;
}

function makeSureTeamsHaveCaptains(message, data) {
    if (data.teams["RED Team"].length > 0) {
        const userId = getUserIdByUserName(data.teams["RED Team"][0], data.players);
        message.guild.members.fetch(userId).then((user) => {
            user.roles.add(pickupCaptainRoleId)
        })

    }
    if (data.teams["BLUE Team"].length > 0) {
        const userId = getUserIdByUserName(data.teams["BLUE Team"][0], data.players);
        message.guild.members.fetch(userId).then((user) => {
            user.roles.add(pickupCaptainRoleId)
        });
    }
}



function gameResetMessage(data, player, message) {
    const userDiscordId = getUserIdByUserName(player, data.players);
    message.guild.members.fetch(userDiscordId).then((user) => {
        user.send(`The Pickup game that you were in queue for was ended by a captain. You've been added to a Pickup team and I'll let you know when the next Pickup game starts.\n**Check the Pickup channel to see your current team or to leave the the pickup if you can't play anymore.**`);
    })

}


async function getRconPlayersList(message) {
    let sentList = "";
    const rconList = await rconPlayersListForPickups(server)
    if (rconList.length === 0) {
        em.cautionEmbed(message, "``NO PLAYERS ON SERVER``", "There are no players on the server.");
        return;
    } else {
        rconList.forEach((player) => {
            sentList += `${player}\n`;
        })
    }
    message.reply(sentList);
}











async function makePickupGameResetEmbed(message) {
    data = getAliasData(filePath);

    const playAgainRole = message.guild.roles.cache.find(role => role.id === replayRoleID);
    


    let redBluePlayersArray = [];
    let confirmedArray = [];

    data.teams["RED Team"].forEach((player) => {
        const userId = getUserIdByUserName(player, data.players);
        giveUserHiddenPickupChannelRole(message, userId, playAgainRole);
        setTimeout(() => {});
        redBluePlayersArray.push(userId);
    });

    data.teams["BLUE Team"].forEach((player) => {
        const userId = getUserIdByUserName(player, data.players);
        giveUserHiddenPickupChannelRole(message, userId, playAgainRole);
        setTimeout(() => {});
        redBluePlayersArray.push(userId);
    });
    setTimeout(() => {
        createReactionCollector(redBluePlayersArray, confirmedArray, message, playAgainRole)
    }, 2000)
}





async function createReactionCollector (redBluePlayersArray, confirmedArray, message, playAgainRole) {
    const repeatChannel = message.guild.channels.cache.find((channel) => channel.id === replayChannelID);

    repeatChannel.send(`<@&${replayRoleID}>`)
    
    const embed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Play Again?")
        .setDescription("DESCRIPTION")
        .addField("Would you like to continue playing Pickups?", "Click ✅ to confirm.")


    
    const confirmMessage = await repeatChannel.send({
        embeds: [embed]
    });


    await confirmMessage.react("✅");
    const filter = (reaction, user) => {
        return redBluePlayersArray.includes(user.id) && reaction.emoji.name === "✅";
    };

    const collector = confirmMessage.createReactionCollector({
        filter,
        time: 113000,
    });

    message.client.on("messageReactionAdd",  (reaction, user) => {
        if(redBluePlayersArray.includes(user.id) && reaction.emoji.name === "✅" && reaction.message.id === confirmMessage.id && user.id !== process.env.BOT_ID) {
            if (!confirmedArray.includes(user.id)) confirmedArray.push(user.id);
        }
    })

    message.client.on("messageReactionRemove", (reaction, user) => {
        if (redBluePlayersArray.includes(user.id) && reaction.emoji.name === "✅" && reaction.message.id === confirmMessage.id) {
            const index = confirmedArray.indexOf(user.id);
            confirmedArray.splice(index, 1);
        }
    })

    collector.on('end', () => {

        console.log(confirmedArray);
        const userNamesArray = getUserNameArray(confirmedArray);
        removePlayersWhoDontWantToPlayAgain(userNamesArray, message);

        removeHiddenPickupChannelRole(playAgainRole);

        repeatChannel.bulkDelete(2)
        data = writeAliasData(filePath, data);
    });
}



function getUserNameArray(confirmedArray) {
    let userNameArray = [];

    confirmedArray.forEach((userId) => {
        let userName = data.players[userId];
        userNameArray.push(userName);
    });
    return userNameArray;
}




function removePlayersWhoDontWantToPlayAgain(array, message) {
    data = getAliasData(filePath)
    console.log(array);
    data.teams["RED Team"].forEach((player, index) => {
        if (!array.includes(player)) {
            if (index === 0) {
                removeCaptainRole(data, "RED Team", player, message)
            }
            data.teams["RED Team"].splice(data.teams["RED Team"].indexOf(player), 1);
            console.log("Kicking " + player + " from RED Team");
        }
    });
    data.teams["BLUE Team"].forEach((player, index) => {
        if (!array.includes(player)) {
            if (index === 0) {
                removeCaptainRole(data, "BLUE Team", player, message)
            }
            data.teams["BLUE Team"].splice(data.teams["BLUE Team"].indexOf(player), 1);
            console.log("Kicking " + player + " from BLUE Team");
        }
    });
   data = writeAliasData(filePath, data);

}

function giveUserHiddenPickupChannelRole(message, userId, role) {
    const user = message.guild.members.cache.find((user) => user.id === userId);
    user.roles.add(role);
}

function removeHiddenPickupChannelRole(role) {
    role.members.forEach((member) => {
        member.roles.remove(role);
    })
}






module.exports = {
    pickupGame,
    wipeAllTeams,
}