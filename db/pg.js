const { Client } = require("pg");
const pgClient = new Client({
  user: "lxsesrcv",
  host: "chunee.db.elephantsql.com",
  database: "lxsesrcv",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = pgClient;
