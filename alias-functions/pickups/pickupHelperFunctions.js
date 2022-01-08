const exec = require("child_process").exec;
const botRebootCommand = process.env.BOT_REBOOT_COMMAND;

    // run when someone runs start or auto start happens
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



      function playersOnTeams(data) {
        if(data.teams["RED Team"] && data.teams["RED Team"].length > 0 || data.teams["BLUE Team"] && data.teams["BLUE Team"].length > 0) {
          return true;
        }
      };



      const phf = {
        restartOtherBot,
      }

      module.exports = phf;