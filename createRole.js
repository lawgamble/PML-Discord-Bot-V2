async function createRole(message, arguments) {
    let teamName = arguments.join(" ");
    console.log("The role should be called:", teamName);
 let newRole = await message.guild.roles.create({
        name: teamName,
     })
}

module.exports = createRole;