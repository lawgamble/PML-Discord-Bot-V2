const net = require("net");
const server = require("../serverCreds");

let socket = {};

function connectToServer(server, message) {
  const userCommand = message.content.slice(1);
  console.log(userCommand);
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
      console.log("DATA", data.toString());
      if (data.toString().startsWith("Password:")) {
        socket.write(server.password);
      }
      if (data.toString().startsWith("Authenticated=1")) {
        console.log("Logged in!");
        (async () => {
          socket.function = await commandHandler(socket, userCommand);
          resolve(socket);
        })();
      }
      if (data.toString().startsWith("Authenticated=0")) {
        console.log(data, "RCON login not authenticated!");
      }
    });
  });
}

// function commandRouter(socket, userCommand) {
//   const verb = userCommand.split(" ")[0].toLowerCase();
//   console.log("VERB", verb);
//   const commandObject = {
//     serverinfo: getServerDetails(socket, userCommand),
//     switchmap: switchMap(socket, userCommand),
//     rotatemap: commandHandler,
//   };
//   console.log(commandObject[verb]);
//   return commandObject[verb];
// }

async function getServerDetails(socket, userCommand) {
  let playersList = [];
  const refreshList = await commandHandler(socket, "RefreshList");
  const playerList = refreshList.PlayerList;
  if (playerList.length > 0) {
    for (const p of playerList) {
      const pID = p.UniqueId;
      const pDetails = await commandHandler(socket, "InspectPlayer " + pID);
      playersList.push(pDetails);
    }
  }
  const serverInfo = await commandHandler(socket, userCommand);
  const respObj = { serverInfo: serverInfo, playerList: playersList };
  socket.end();
  socket.destroy();
  return respObj;
}

// Command Handler
async function commandHandler(socket, userCommand) {
  const try1 = await commandExecute(socket, userCommand);
  if (try1) {
    return try1;
  } else {
    const try2 = await commandExecute(socket, userCommand);
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

async function switchMap(socket, userCommand) {
  const mapSwitch = await commandHandler(socket, userCommand);
  socket.end();
  socket.destroy();
  return "Map Switched";
}

module.exports = connectToServer;
