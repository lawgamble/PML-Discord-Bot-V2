const { createPool } = require("mysql");

const pool = createPool({
  host: "8.9.15.188",
  user: "gamble",
  password: "1988Escort!",
  database: "pavlov",
  connectionLimit: 10,
});

async function push2db(message, players, teams) {
  for (let player in players) {
    const discordId = player;
    const userName = players[player].slice(2);
    const discordUser = await message.client.users.fetch(discordId);

    const userQuery = `INSERT INTO users (user_name, discord_id) VALUES ('${userName}', '${discordId}')`;

    pool.query(userQuery, (error, result) => {
      if (error) throw error;
      console.log(result);
    });
  }
}

module.exports = push2db;
