async function deleteRole(message, arguments) {
    const roleToDelete = arguments.join(" ");
    let foundRole = await message.guild.roles.cache.find(role => role.name === roleToDelete);
    if(foundRole) {
        foundRole.delete();
    } else {
        message.reply("I wasn't able to delete the Team Role...I guess it's just not my day.")
    }
}

module.exports = deleteRole;