require("dotenv").config();
const fs = require("fs");
const filePath = "../aliases.json";



function getAliasData(filePath) {
    const aliases = fs.readFileSync(filePath);
    const data = JSON.parse(aliases);
    return data;
}

const {teams} = getAliasData(filePath);

console.log("returned data: ", teams);

