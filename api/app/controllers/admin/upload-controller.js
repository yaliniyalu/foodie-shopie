const fs = require("fs");
const sanitize = require("sanitize-filename");
const {Response} = require("../../helpers");

/** @type {ExpressRequestHandler} */
const upload = (req, res) => {
    if (req.query['replace']) {
        fs.unlink(process.env.UPLOAD_DIR + "/temp/" + sanitize(req.query['replace']), () => {})
    }

    res.json(Response.success({
        name: req['file'].filename,
        path: process.env.UPLOAD_URL + '/temp/' + req['file'].filename
    }))
}

/** @type {ExpressRequestHandler} */
async function remove(req, res) {
    if (req.query['file']) {
        fs.unlink(process.env.UPLOAD_DIR + "/temp/" + sanitize(req.query['file']), () => {})
    }

    res.send(Response.success())
}

module.exports = {
    upload,
    remove
}
