// command "pickup swap <@discord user>"

// message must have a mention of the player to be switched with -- that player must be on the other team.

// check if user is on red/blue team - if not, tell em to fuck off

//if so, check if tagged user is on the opposit team

//if so, send 

const JSONFunctions = require("../../JSONParser.js");
const Discord = require("discord.js");


let data;
let userToBeSwappedTeam;
let switchFlag = false;

const filePath = process.env.ALIASES_FILEPATH; 


async function switchWithPlayer(message) {
    // check to see if both teams exist
    // if (!doBothTeamsExist()) {
    //     return
    // }
    // if there is no mention, return saying you need to tag someone
    if(!message.mentions.users.first()) {
        message.reply("You need to tag a valid player on the opposite team in order to use this command.");
        return;
    }
    if (switchFlag) {
        return message.reply("Only one switch at a time. Wait for the current switch to execute, or cancel.");
    }

    const authorName = message.author.username;
    const authorId = message.author.id;
    data = JSONFunctions.getAliasData(filePath);

    if (!userOnTeam(authorId, data)) {
        return message.reply("You aren't on a team. You can't switch.");
    }

    const user2Id = message.mentions.users.first().id;
    const user2Name = data.players[user2Id];

    if(authorId === user2Id) {
        return message.channel.send("https://media0.giphy.com/media/KBaxHrT7rkeW5ma77z/giphy.gif?cid=ecf05e474w62ajs5334uiltt0mehk1aqo5rptt9auwoj3f31&rid=giphy.gif&ct=g");
    }

    if(!user2OnATeam(user2Name)) {
        return message.reply("That user isn't on a team. You can't switch.");
    }

    if(!user2OnOppositTeam(authorId, user2Name)) {
        return message.reply("Player is not on the other team.");
    }
   return createConfirmMessage(message, authorName, authorId, user2Name, user2Id);
}


function userOnTeam(authorId, data) {
    let userName;
    if(data.players.hasOwnProperty(authorId)) {
        userName = data.players[authorId];
    }
    if(data.teams.hasOwnProperty("RED Team") && data.teams["RED Team"].includes(userName)) {
        userToBeSwappedTeam = "BLUE Team";
         return true;
    }
    if(data.teams.hasOwnProperty("BLUE Team") && data.teams["BLUE Team"].includes(userName)) {
        userToBeSwappedTeam = "RED Team";
        return true;
    } 
    return false;
}


function user2OnOppositTeam(authorId, user2Name) {
    let authorTeam;
    let swapperTeam;
    if(data.teams.hasOwnProperty("RED Team") && data.teams["RED Team"].includes(data.players[authorId])) {
        authorTeam = "RED Team";
    }
    if(data.teams.hasOwnProperty("BLUE Team") && data.teams["BLUE Team"].includes(data.players[authorId])) {
        authorTeam = "BLUE Team";
    }
    if(data.teams.hasOwnProperty("RED Team") && data.teams["RED Team"].includes(user2Name)) {
        swapperTeam = "RED Team";
    }
    if(data.teams.hasOwnProperty("BLUE Team") && data.teams["BLUE Team"].includes(user2Name)) {
        swapperTeam = "BLUE Team";
    }

    if(authorTeam === swapperTeam) {
        return false;
    } else {
        return true;
    }
}

function user2OnATeam(user2Name) {
    if(data.teams.hasOwnProperty("RED Team") && data.teams["RED Team"].includes(user2Name)) {
        return true;
    } else if (data.teams.hasOwnProperty("BLUE Team") && data.teams["BLUE Team"].includes(user2Name)) {
        return true;
    } else {
        return false;
    }
}
 

async function createConfirmMessage(message, authorName, authorId, user2Name, user2Id) {
    switchFlag = true;
    const embed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("The Ol' Switcharoo")
        .setDescription(`${data.players[authorId].slice(2)}\n wants to swap with\n${data.players[user2Id].slice(2)}.`)
        .addField("Shall we swap teams?", "Click ✅ to confirm; ❌ to deny.")

    const confirmMessage =  await message.channel.send({embeds: [embed]});
    await confirmMessage.react("✅");
    await confirmMessage.react("❌");

// needs to be the tagged user's id
   const filter = (reaction, user) => {
       return user.id === user2Id;
   };

    const confirm = confirmMessage.createReactionCollector({
        filter,
        time: 60000,
        max: 1
    });

    confirm.on('collect', reaction => {
        switchFlag = false;
        if (reaction.emoji.name === '✅') {
            message.channel.send(`Players have successfully swapped.`);
            data = JSONFunctions.getAliasData(filePath);
            
            data.teams[userToBeSwappedTeam][data.teams[userToBeSwappedTeam].indexOf(user2Name)] = data.players[authorId];

            userToBeSwappedTeam === "RED Team" ? userToBeSwappedTeam = "BLUE Team" : userToBeSwappedTeam = "RED Team";

            data.teams[userToBeSwappedTeam][data.teams[userToBeSwappedTeam].indexOf(data.players[authorId])] = user2Name;

            data = JSONFunctions.writeAliasData(filePath, data);

            confirmMessage.delete();
            message.delete();
        } else if (reaction.emoji.name === '❌') {
            switchFlag = false;
            message.channel.send("Switch cancelled.");
            confirmMessage.delete();
            message.delete();
        }
    });

    confirm.on('end', reaction => {
            switchFlag = false;
            confirmMessage.delete();
            message.delete();  
    });
}
    
    


module.exports = switchWithPlayer;