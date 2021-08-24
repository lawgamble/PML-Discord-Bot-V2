const readAliasFile = require("./JSONParser");
const fs = require("fs");
const playerOnAnotherTeam = require("./playerOnAnotherTeam.js")
const rosterEmbed = require("./rosterEmbed")
const LeaguePlayerRoleId = process.env.LP_ID;
const RingerRoleId = process.env.RR_ID;
const teamNewsId = process.env.TEAM_NEWS_ID;
const rostersChannelId = process.env.ROSTERS_ID;

const PREFIX = "!";

function addPlayerToTeam(filePath, message) {
    const arguments = message.content.slice(PREFIX.length, message.content.indexOf("@") - 1).trim().split(/ +/g);
    const remove = arguments.shift();
    const teamName = arguments.join(" ")

    const userMentionedIds = message.mentions.users.map((user) => user.id);
    const userMentionedNames = message.mentions.users.map((user) => user.username);


    let registeredArray = [];
    let notRegisteredArray = [];
    let onAnotherTeamArray = [];
    let registeredIds = [];

    if (userMentionedIds.length > 1) {
        message.reply("Only add one player to a team at a time!");
        return;
    }


    readAliasFile(filePath, (error, data) => {
        if (error) {
            console.log(error)
        } else {

            const teamsListData = data.teams;
            const playersListData = data.players;



            // if team name exists
            if (teamsListData.hasOwnProperty(teamName)) {

                userMentionedIds.forEach((id, index) => {

                    if (!playerOnAnotherTeam(message, teamsListData, playersListData[id], userMentionedNames[index])) {
                        if (playersListData.hasOwnProperty(id)) {

                            registeredIds.push(id);

                            registeredArray.push(userMentionedNames[index])
                            teamsListData[teamName].push(playersListData[id])

                            // find user in discord by discordId
                            const newTeamMember = message.mentions.members.find(user => user.id === id);

                            // find specific team role
                            const teamRole = message.guild.roles.cache.find((role) => role.name === teamName);
                            newTeamMember.roles.add(teamRole).catch(console.error)
                            let LeagueRole = message.guild.roles.cache.get(LeaguePlayerRoleId);
                            newTeamMember.roles.add(LeagueRole).catch(console.error);
                            const ringerRole = message.guild.roles.cache.find((role) => role.id === RingerRoleId);

                            if (newTeamMember.roles.cache.has(RingerRoleId)) {
                                newTeamMember.roles.remove(ringerRole);
                            }


                        } else {
                            notRegisteredArray.push(userMentionedNames[index]);
                        }
                    } else {
                        onAnotherTeamArray.push(userMentionedNames[index]);
                    }

                })
            } else {
                message.reply(`The team name **${teamName}** doesn't exist. This is **case sensitive**, so check spelling and casing.`)
                return;
            }
            teamsListData[teamName] = [...new Set(teamsListData[teamName])];

            fs.writeFile(filePath, JSON.stringify(data, null, 2), error => {
                if (error) {
                    console.log(error)
                }
            })
        }
        if (registeredArray.length > 0) {
            let discordUserData = message.mentions.users.find((user) => user.id === registeredIds[0])
            message.reply(`Player(s):  **${registeredArray.join(', ')}** were added to the team: **${teamName}**`)

            let newsChannel = message.guild.channels.cache.get(teamNewsId);
            newsChannel.send(`${discordUserData} has joined ${teamName}`).catch(console.error);


            rosterEmbed(filePath, message);



        }
        if (notRegisteredArray.length > 0) {
            message.reply(`Player(s): **${notRegisteredArray.join(', ')}** were not added to the **${teamName}** because they have not registered!`)
        }
    })
}

module.exports = addPlayerToTeam;