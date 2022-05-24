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

function getAliasData(filePath) {
  return JSON.parse(fs.readFileSync(filePath).toString());
}

function writeAliasData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return getAliasData(filePath);
  }


const JSONFunctions = { readAliasFile, getAliasData, writeAliasData };

module.exports = JSONFunctions;
