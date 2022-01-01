const { createPool } = require("mysql");

function getInfo(message) {
  const user = message.author.id;

  const pool = createPool({
    host: "8.9.15.188",
    user: "gamble",
    password: "1988Escort!",
    database: "pavlov",
    connectionLimit: 10,
  });

  pool.query(`select * from users`, (err, result, fields) => {
    if (err) return message.reply(`${err}`);
    const endResult = `User ID: ${result[0].user_id}\nRegistered Name: ${result[0].name}\nTeam ID: ${result[0].team_id}`;
    console.log(result);
    return message.reply(`${result[0].discord_id}`);
  });
}

function getStats(message) {
  const pool = createPool({
    host: "localhost",
    user: "root",
    password: "1988Escort!",
    database: "pavlov",
    connectionLimit: 10,
  });

  pool.query(`select * from stats`, (err, result, fields) => {
    if (err) return message.reply(`${err}`);
    const endResult = `Kills: ${result[0].kills}\n Deaths: ${result[0].deaths}`;
    message.reply(endResult);
  });
}

module.exports = {
  getInfo,
  getStats,
};
