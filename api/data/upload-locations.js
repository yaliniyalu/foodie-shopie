
const fs = require("fs");
const path = require("path");

const ADMIN_ID = 'd6e226ed-e17f-415d-a241-c18d5587e2de'
require('dotenv').config({path: path.resolve(__dirname , '../.env')})

const {tgUpsert, createVertexQuery, createUID, createEdgeQuery} = require("../app/tg-helpers");
const Schema = require("../app/tg-schema");

const locations = JSON.parse(fs.readFileSync(__dirname + '/json/locations.json').toString())

const vertexes = [];
const edges = [];

for (const location of locations) {
    vertexes.push(createVertexQuery(Schema.Location, location._id, location))
    edges.push(createEdgeQuery(Schema.Location.edges.LOCATION_CREATED_BY, location._id, ADMIN_ID, {time: new Date('2020-04-11T15:16').toISOString()}))
}

tgUpsert(vertexes, edges).then(r => console.log(r)).catch(e => console.log(e))
