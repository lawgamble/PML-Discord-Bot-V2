function createRole(message, arguments) {
    let teamName = arguments.join(" ");
 let newRole = message.guild.roles.create({
        name: teamName,
     })
}

module.exports = createRole;