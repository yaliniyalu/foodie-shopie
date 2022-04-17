const axios = require("axios");

const api = axios.create({
    baseURL: process.env.TG_SERVER,
    headers: {
        Authorization: 'Bearer ' + process.env.TG_TOKEN
    }
})

module.exports = api
