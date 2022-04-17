const {Response} = require("../helpers");

/** @type {ExpressRequestHandler} */
module.exports.responseMiddleware = (req, res, next) => {
    res.sendSuccess = function (data, message = '') {
        return res
            .status(200)
            .json(Response.success(data, message))
    }

    res.sendError = function (message, error, code) {
        return res
            .status(400)
            .json(Response.error(message, error, code))
    }

    next()
}
