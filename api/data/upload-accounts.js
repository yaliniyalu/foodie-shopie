const fs = require("fs");
const path = require("path");

require('dotenv').config({path: path.resolve(__dirname , '../.env')})

const {tgUpsert} = require("../app/tg-helpers");

console.log(process.env.TG_SERVER, __dirname, path.resolve(__dirname, '../.env'))

const data = JSON.parse(fs.readFileSync(__dirname + '/json/accounts.json').toString())
//
// tgUpsert(data.vertexes, data.edges).then(r => console.log(r)).catch(e => console.log(e))
