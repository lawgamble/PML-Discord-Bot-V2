const net = require("net");

const list = [];

async function rconPlayersListForPickups() {
  const server = {
    port: process.env.SERVER_PORT,
    ip: process.env.PICKUP_SERVER_IP,
    password: process.env.SERVER_PASSWORD,
  };
  const playersListArray = await connectToServer(server);
  console.log("LIST:", list);
  return list;
}

function connectToServer(server) {
  return new Promise((resolve) => {
    socket = net.Socket();

    socket.connect(server.port, server.ip, () => {
      console.log();
    });

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
          resolve(socket);
          socket.function = await getServerDetails(socket);
        })();
      }
      if (data.toString().startsWith("Authenticated=0")) {
        console.log(data, "RCON login not authenticated!");
      }
    });
  });
}


async function getServerDetails(socket) {
  const refreshList = await commandHandler(socket, "RefreshList");

  const playerList = refreshList.PlayerList;

  if (playerList.length > 0) {
    for (const p of playerList) {
      const userName = p.UniqueId;

      if (!list.includes(userName)) list.push(userName);
    }
  }
  const serverInfo = await commandHandler(socket, "");

  socket.end();
  socket.destroy();
  // return playersList;
}

// Command Handler
async function commandHandler(socket, command) {
  const try1 = await commandExecute(socket, command);
  if (try1) {
    return try1;
  } else {
    const try2 = await commandExecute(socket, command);
    return try2;
  }
}

function commandExecute(socket, userCommand) {
  return new Promise((resolve) => {
    socket.write(userCommand);
    socket.once("data", function (data) {
      const dataResult = data.toString();
      try {
        const jsonResult = JSON.parse(dataResult);
        console.log(jsonResult);
        socket.end();
        socket.destroy();
        return resolve(jsonResult);
      } catch (e) {
        console.log(e, "Bad rcon Response:", userCommand, dataResult);
        return resolve(null);
      }
    });
  });
}

module.exports = rconPlayersListForPickups;
