async function createRole(message, arguments) {
    let teamName = arguments.join(" ");
 let newRole = await message.guild.roles.create({
        name: teamName,
     })
}

module.exports = createRole;