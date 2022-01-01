const { thirtyFiveMinuteTimer, ninetyMinuteTimer } = require("./alias-functions/pickupGame");
const { thirtyFiveMinuteTimer2, ninetyMinuteTimer2 } = require("./alias-functions/pickupGame2");


export function deletePickupTeams(data) {
    delete data.teams["RED Team"];
    delete data.teams["BLUE Team"];
    delete data.teams["BLACK Team"];
    delete data.teams["GOLD Team"];
}

export function clearAllTimeouts() {
    clearTimeout(thirtyFiveMinuteTimer);
    clearTimeout(ninetyMinuteTimer);
    clearTimeout(thirtyFiveMinuteTimer2);
    clearTimeout(ninetyMinuteTimer2);
}

export function writeToAliasFile(data) {
   return fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
          console.log(error);
        }
      });
}







