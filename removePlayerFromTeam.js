const readAliasFile = require("./JSONParser");
const fs = require("fs");
const rosterEmbed = require("./rosterEmbed")
const LeaguePlayerRoleId = process.env.LP_ID;
const teamNewsId = process.env.TEAM_NEWS_ID;
const rostersChannelId = process.env.ROSTERS_ID;

const PREFIX = "!";


function removePlayerFromTeam(filePath, message) {
    const arguments = message.content.slice(PREFIX.length, message.content.indexOf("@") - 1).trim().split(/ +/g);
    const remove = arguments.shift();
    const teamName = arguments.join(" ")

    const userMentionedIds = message.mentions.users.map((user) => user.id);
    const userMentionedNames = message.mentions.users.map((user) => user.username);


    let newsChannel = message.guild.channels.cache.get(teamNewsId);
    let rostersChannel = message.guild.channels.cache.get(rostersChannelId);

    let deletedArray = [];
    let notDeletedArray = [];
    let discordIdArray = [];


    readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error)
        } else {

            const playersListData = data.players;
            const teamsListData = data.teams;


            // if team name exists
            if (teamsListData.hasOwnProperty(teamName)) {
                userMentionedIds.forEach((id, index) => {
                    discordIdArray.push(id)

                    const playerToBeDeleted = playersListData[id];
                    const teamArray = teamsListData[teamName];

                    let deleteIndex = teamArray.indexOf(playerToBeDeleted)

                    if (teamArray.includes(playerToBeDeleted)) {
                        deletedArray.push(userMentionedNames[index]);
                        teamArray.splice(deleteIndex, 1);

                        //find member by discordId
                        const memberBeingRemoved = message.mentions.members.find(user => user.id === id);
                        // find role that needs to be removed
                        const teamRole = message.guild.roles.cache.find((role) => role.name === teamName);
                        memberBeingRemoved.roles.remove(teamRole).catch(console.error);

                        let LeagueRole = message.guild.roles.cache.get(LeaguePlayerRoleId);
                        memberBeingRemoved.roles.remove(LeagueRole).catch(console.error);

                    } else {

                        notDeletedArray.push(userMentionedNames[index]);
                        console.log(notDeletedArray)
                    }
                })
            } else {
                message.reply(`The team name **${teamName}** doesn't exist. This is **case sensitive**, so check spelling and casing.`)
                return;
            }



            let discordUserData = message.mentions.users.find((user) => user.id === discordIdArray[0])

            if (deletedArray.length === 0 && notDeletedArray.length > 0) {
                message.reply(`The members you gave to be deleted **(${notDeletedArray.join(", ")})** aren't actually on the **${teamName}**!`)
            }
            if (deletedArray.length > 0 && notDeletedArray.length > 0) {
                message.reply(`These players were deleted from the team **${teamName}**: ${deletedArray.join(", ")}. Player(s) **${notDeletedArray.join(", ")}** weren't actually registered, therefore aren't on any team! `)

                newsChannel.send(`${discordUserData} has left ${teamName}`).catch(console.error);
                rosterEmbed(filePath, message);

            }
            if (deletedArray.length > 0 && notDeletedArray.length === 0) {
                message.reply(`These players have been deleted from the team **${teamName}**: **${deletedArray.join(", ")}**.`)

                newsChannel.send(`${discordUserData} has left ${teamName}`).catch(console.error);
                rosterEmbed(filePath, message);
            }
            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                }
            })

        }
    })
}


module.exports = removePlayerFromTeam;