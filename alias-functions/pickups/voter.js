const filePath = process.env.VOTER_FILEPATH;
const em = require("../../discord-functions/generalEmbed");
const fs = require("fs");
const schedule = require('node-schedule');
var CronJob = require('cron').CronJob;

const pto1 = process.env.PTO_1;
const pto2 = process.env.PTO_2;
const pto3 = process.env.PTO_3;
const pto4 = process.env.PTO_4;
const pto5 = process.env.PTO_5;
const pto6 = process.env.PTO_6;

let data;



function voter(message) {
    const userName = message.mentions.users.first().username;
    const userId = message.mentions.users.first().id;
    const votedBy = message.author.id;

    data = getAliasData(filePath);
    createUser(data, userName, userId, votedBy, message);

    writeAliasData(filePath, data);
}




function createUser(data, userName, userId, votedBy, message) {
    if (!data.users.hasOwnProperty(userName)) {
        data.users[userName] = {
            votes: 1,
            id: userId,
            votedBy: [votedBy],
        };
        createTimout(userName, userId, message);
    } else {
        if(data.users[userName].votedBy.includes(votedBy)) { // add ! to condition
        data.users[userName].votes++;
        data.users[userName].votedBy.push(votedBy);
    } else {
        em.cautionEmbed(message, "FAILED", `You have already voted for ${userName}!`);
    }
  }
};

function addUserToTimeout(userName, userId, message) {
    if(!data.timeout.hasOwnProperty(userName)) {
        data.timeout[userName] = {
            timeInit: [Date.now()],
            id: userId,
            votes: 1
        }
    } else {
        data.timeout[userName].votes++;
        data.timeout[userName].timeInit.push(Date.now());
    }
    writeAliasData(filePath, data);
    checkTimoutVotes(userName, userId, message);  
};

function createTimout(userName, userId, message) {
    const sixMinTimer = setTimeout(() => {
        endVoting(userName, userId, message);
    }, 15000); // six minutes
}

function checkTimoutVotes(userName, userId, message) {
    data = getAliasData(filePath);
    let userTimoutCount = data.timeout[userName].votes;
    let schedulerName = userName.toString();

    // get discord user
    const user = message.guild.members.cache.find(member => member.id === userId);

    switch (userTimoutCount) {
        case 1:
            user.roles.add(pto1);
            user.send("You've been banned from pickups for 6 hours. Get it together!")

            // let date = new Date();
            // date.setHours(date.getHours() + 6);

            let date = new Date();
            date.setMinutes(date.getMinutes() + 1);

            let job = new CronJob(date, function() {
                user.roles.remove(pto1);
                user.send("You can now re-join the pickup games. Stay out of trouble!");
            });
            job.start();


            break;
        case 2:
            if(user.roles.cache.has(pto1)) {
                user.roles.remove(pto1);
            }
            user.roles.add(pto2);
            user.send("You've been banned from pickups for 24 hours. C'mon, man. Grow up!")

            date = new Date();
            date.setDate(date.getDate() + 1);

            job = new CronJob(date, function() {
                user.roles.remove(pto2);
                user.send("You can now re-join the pickup games. Stay out of trouble!");
            });
            job.start();
            
            break;
        case 3:
            if(user.roles.cache.has(pto2)) {
                user.roles.remove(pto2);
            }
            user.roles.add(pto3);
            user.send("You've been banned from pickups for 48 hours. Bro, wtf is wrong with you?!")

            date = new Date();
            date.setDate(date.getDate() + 2);

            job = new CronJob(date, function() {
                user.roles.remove(pto3);
                user.send("You can now re-join the pickup games. Stay out of trouble!");
            });
            job.start();

            break;
        case 4:
            if(user.roles.cache.has(pto3)) {
                user.roles.remove(pto3);
            }
            user.roles.add(pto4);
            user.send("You've been banned from pickups for 1 week. One more and you're perma-banned!");

            date = new Date();
            date.setDate(date.getDate() + 7);

            job = new CronJob(date, function() {
                user.roles.remove(pto4);
                user.send("You can now re-join the pickup games. Stay out of trouble!");
            });
            job.start();

            break;
        case 5:
            if(user.roles.cache.has(pto4)) {
                user.roles.remove(pto4);
            }
            user.roles.add(pto5);
            user.send("You've been perma-banned from the pickup games. Maybe the mods will show you mercy, but you did this to yourself.");
            break;
    }
};

// 2592000000 = 30 days

function endVoting(userName, userId, message) {
    data = getAliasData(filePath);
    console.log("VOTES:", data.users[userName].votes);

    if (data.users[userName].votes > 5) addUserToTimeout(userName, userId, message);
    delete data.users[userName];
    writeAliasData(filePath, data);
}

function getAliasData(filePath) {
    const aliases = fs.readFileSync(filePath);
    const data = JSON.parse(aliases);
    return data;
  }
  
function writeAliasData(filePath, data) {
    return fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
 }

 function clearVotesData() {
     data = getAliasData(filePath);
     data = {
        "users": {},
        "timeout": {}
      }
      writeAliasData(filePath, data);
 }




function checkVoteCount(message) {
     const userName = message.author.username;
     data = getAliasData(filePath);
     
     if(data.users.hasOwnProperty(userName)) {
         return message.reply(`You have ${data.users[userName].votes} ${data.users[userName].votes > 1 ? 'votes' : 'vote'}`);
     } else {
            return message.reply(`You have no votes.`);
     }
}

function clearUserVotes(filePath) {
    const data = getAliasData(filePath);
    data.users = {};
    writeAliasData(filePath, data);
}

module.exports = {voter, clearVotesData, checkVoteCount, clearUserVotes}