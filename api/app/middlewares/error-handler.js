const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");

function errorHandler (err, req, res, next) {
    console.log('error handler: ', err)
    if (res.headersSent) {
        return next(err)
    }

    return res
        .status(StatusCodes.BAD_REQUEST)
        .json(Response.error(err.message ?? "Internal Server Error", null, 500))
}

module.exports = errorHandler
