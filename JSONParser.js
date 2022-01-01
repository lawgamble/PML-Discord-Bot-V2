const fs = require("fs");

function readAliasFile(filePath, callback) {
  fs.readFile(filePath, "utf-8", (error, data) => {
    if (error) {
      return callback && callback(error);
    } else {
      try {
        const aliases = JSON.parse(data);
        return callback && callback(null, aliases);
      } catch (error) {
        return callback && callback(error);
      }
    }
  });
}

module.exports = readAliasFile;
