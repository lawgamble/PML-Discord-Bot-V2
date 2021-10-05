require("dotenv").config();

const serverPort = process.env.SERVER_PORT;
const serverIp = process.env.SERVER_IP;
const serverPassword = process.env.SERVER_PASSWORD;

const server = {
  port: serverPort,
  ip: serverIp,
  password: serverPassword,
};

module.exports = server;
