  const pg = require("./pickupGame")
  
  // starts after 5 minutes, checks every 1 min interval.



  function pickupKicker(filePath, gameStarted, message) {
    let gameEnded;
    setTimeout(() => {
      const interval = setInterval(() => {
  
        readAliasFile(filePath, (error, data) => {
          if (error) {
            console.log(error);
          }
          gameEnded = checkInactivePlayers(filePath, data, message, gameStarted);
        })
        if(!gameStarted || gameEnded === true) {
            phf.wipeRedAndBlueTeams(message, filePath, pg.thirtyFiveMinuteTimer, pg.ninetyMinuteTimer)
            clearInterval(interval);
            return;
        }
      }, 15000); // 1 min
    }, 30000); // 5 min
  }

  module.exports = pickupKicker