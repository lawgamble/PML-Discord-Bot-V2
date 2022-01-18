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
  const aliases = fs.readFileSync(filePath);
  const data = JSON.parse(aliases);
  return data;
}

function writeAliasData(filePath, data) {
  return fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

module.exports = {readAliasFile, getAliasData, writeAliasData};
