const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");
const jwt = require("jsonwebtoken");

/** @returns {ExpressRequestHandler} */
const authenticate = (audience) => {
    return (req, res, next) => {
        if (req.method === 'OPTIONS') {
            return next()
        }

        if (!req.header('Authorization')) {
            return next()
        }

        const token = req.header('Authorization').replace("Bearer ", "")
        let decoded = null;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {audience})
        } catch (e) {
            return next()
        }

        req.user = decoded
        req.userId = decoded.sub

        next()
    }
}

/** @type {ExpressRequestHandler} */
const requiresAuth = (req, res, next) => {
    if (!req.user) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(Response.error("Unauthorized"))
    }

    next()
}

module.exports = { authenticate, requiresAuth }
