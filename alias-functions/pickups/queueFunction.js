     // if gameStarted and teams are full, add player to QUEUE Team
     if (gameStarted && arguments[0] === "red" || gameStarted && arguments[0] === "blue") {
        let data = readAliasData(filePath);
        if(data.teams["RED Team"].length === 5 && data.teams["BLUE Team"].length === 5) {
          if (checkIfUserIsRegistered(message, data.players, authorId)) {
            playerToAdd = data.players[authorId];
            let queueTeam = data.teams["QUEUE Team"];
            queueTeam.push(playerToAdd);
            //removes duplicate players if they are stupid enough to add themselves more than once
            queueTeam = [...new Set(queueTeam)]
            writeAliasesData(filePath, data);
            return;
          }
        }  
      }