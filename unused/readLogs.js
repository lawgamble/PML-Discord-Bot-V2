require("dotenv").config();

// Tail = require("tail").Tail;

// var options = {
//   separator: /[\r]{0,1}\n/,
//   fromBeginning: false,
//   fsWatchOptions: {},
//   follow: true,
//   logger: console,
// };

// tail = new Tail(process.env.LOGFILE_PATH, options);

// tail.on("line", function (data) {
//   console.log(data);
// });

// tail.on("error", function (error) {
//   console.log("ERROR: ", error);
// });

var fs = require("fs"),
  es = require("event-stream");

var lineNr = 0;
const regExp = /\W\d+\D\d+\D\d+\D\d+\D\d+\D\d+\D\d+\D/g;

var s = fs
  .createReadStream(process.env.LOGFILE_PATH)
  .pipe(es.split(regExp))
  .pipe(
    es
      .mapSync(function (line) {
        // pause the readstream
        s.pause();

        lineNr += 1;
        let dataArray = [];
        if (line.includes("StatManagerLog")) {
          KillData = line.splice("StatManagerLog:");
          const statDataLogs = KillData[1]; // shows all statManagerLogs
          dataArray.push(statDataLogs);
        }
        console.log(dataArray);
        // resume the readstream, possibly from a callback
        s.resume();
      })
      .on("error", function (err) {
        console.log("Error while reading file.", err);
      })
      .on("end", function () {
        console.log("Read entire file.");
      })
  );
