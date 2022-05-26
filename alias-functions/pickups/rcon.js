const net = require("net");
const exec = require("child_process").exec;
const botRebootCommand = process.env.BOT_REBOOT_COMMAND;



function connectToServer(server, pin) {
    return new Promise((resolve) => {
      socket = net.Socket();
  
      socket.connect(server.port, server.ip, () => {});
  
      socket.on("error", function (err) {
        console.log(err);
        resolve(socket);
      });
  
      socket.on("data", function (data) {

        if (data.toString().startsWith("Password:")) {
          socket.write(server.password);
        }
        if (data.toString().startsWith("Authenticated=1")) {
          console.log("Logged in!");
          (async () => {
            socket.function = await commandHandler(socket, `setpin ${pin}`);
            if (socket.function.Successful) {
              socket.end();
              socket.destroy();
            }
            return resolve(socket);
          })();
        }
        if (data.toString().startsWith("Authenticated=0")) {
          console.log(data, "RCON login not authenticated!");
        }
      });
    });
  }
  async function commandHandler(socket, command) {
    const try1 = await commandExecute(socket, command);
    if (try1) {
      return try1;
    } else {
      const try2 = await commandExecute(socket, command);
      return try2;
    }
  }
  
  function commandExecute(socket, command) {
    return new Promise((resolve) => {
      socket.write(command);
      socket.once("data", function (data) {
        const dataResult = data.toString();
        try {
          const jsonResult = JSON.parse(dataResult);
          return resolve(jsonResult);
        } catch (e) {
          console.log(e, "Bad rcon Response:", command, dataResult);
          return resolve(null);
        }
      });
    });
  }

  function restartOtherBot() {
    exec(botRebootCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }

  module.exports = {connectToServer, restartOtherBot};